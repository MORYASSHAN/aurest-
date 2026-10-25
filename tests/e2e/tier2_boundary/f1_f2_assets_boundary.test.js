import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 2: Boundary & Corner Cases');

describe('F1 & F2 Boundary & Corner Cases', () => {
  const rootDir = path.resolve(process.cwd());
  const publicDir = path.join(rootDir, 'public');

  // --- F1 Boundary Tests ---
  it('TC-F1-B01: Zero-byte buffer passed to image decoder throws boundary validation error', async () => {
    const emptyBuf = Buffer.alloc(0);
    let failed = false;
    try {
      await sharp(emptyBuf).metadata();
    } catch {
      failed = true;
    }
    expect(failed).toBe(true);
  });

  it('TC-F1-B02: Truncated or corrupt WebP binary buffer throws decode error', async () => {
    // WebP with RIFF header but truncated VP8 payload
    const corruptBuf = Buffer.from('RIFF\x10\x00\x00\x00WEBPVP8 \x00\x00\x00\x00');
    let failed = false;
    try {
      await sharp(corruptBuf).metadata();
    } catch {
      failed = true;
    }
    expect(failed).toBe(true);
  });

  it('TC-F1-B03: 2048x1024 maximum texture boundary dimension is within WebGL max texture size limit', async () => {
    const atmosPath = path.join(publicDir, 'textures', 'earth_atmos_2048.webp');
    const metadata = await sharp(atmosPath).metadata();

    // Most mobile GPUs support at least 4096 texture size; 2048 is well within boundary
    expect(metadata.width).toBeLessThanOrEqual(2048);
    expect(metadata.height).toBeLessThanOrEqual(1024);
    // Texture dimensions must be power-of-two friendly or exact multiples
    expect(metadata.width % 256).toBe(0);
    expect(metadata.height % 256).toBe(0);
  });

  it('TC-F1-B04: Every WebP asset is strictly smaller than its original unoptimized counterpart', () => {
    const pairs = [
      ['images/founder.png', 'images/founder.webp'],
      ['images/neutralize.jpg', 'images/neutralize.webp'],
      ['images/preserve.jpg', 'images/preserve.webp'],
      ['images/stop.jpg', 'images/stop.webp'],
      ['textures/earth_atmos_2048.jpg', 'textures/earth_atmos_2048.webp'],
      ['textures/earth_clouds_1024.png', 'textures/earth_clouds_1024.webp'],
    ];

    for (const [orig, webp] of pairs) {
      const origSize = fs.statSync(path.join(publicDir, orig)).size;
      const webpSize = fs.statSync(path.join(publicDir, webp)).size;

      // WebP must strictly save bytes
      expect(webpSize).toBeLessThan(origSize);
    }
  });

  it('TC-F1-B05: Cloud texture preserves RGBA 4-channel format for shader alpha transparency', async () => {
    const cloudsPath = path.join(publicDir, 'textures', 'earth_clouds_1024.webp');
    const metadata = await sharp(cloudsPath).metadata();

    // Must have alpha channel (hasAlpha: true or channels: 4)
    expect(metadata.channels).toBe(4);
    expect(metadata.hasAlpha).toBe(true);
  });

  // --- F2 Boundary Tests ---
  it('TC-F2-B01: Rejects protocol-relative CDN references (//cdn.jsdelivr.net) in source files', () => {
    const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
    const content = fs.readFileSync(earthPath, 'utf8');

    expect(content).not.toContain('//cdn.jsdelivr.net');
    expect(content).not.toContain('//unpkg.com');
  });

  it('TC-F2-B02: Case-insensitive scan ensures zero CDN host variations exist in components', () => {
    const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
    const content = fs.readFileSync(earthPath, 'utf8').toLowerCase();

    expect(content).not.toContain('jsdelivr');
    expect(content).not.toContain('unpkg');
    expect(content).not.toContain('cloudflare');
  });

  it('TC-F2-B03: Subdomain variations of external asset CDNs do not exist in next.config.mjs', () => {
    const configPath = path.join(rootDir, 'next.config.mjs');
    const content = fs.readFileSync(configPath, 'utf8');

    expect(content).not.toContain('jsdelivr');
    expect(content).not.toContain('unsplash');
    expect(content).not.toContain('fastly');
  });

  it('TC-F2-B04: Global CSS does not contain remote @import or remote url() font references', () => {
    const cssPath = path.join(rootDir, 'app', 'globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).not.toMatch(/@import\s+url\(['"]https?:\/\//);
    expect(cssContent).not.toMatch(/url\(['"]https?:\/\/(fonts|cdn)/);
  });

  it('TC-F2-B05: Local textures are 100% accessible on filesystem and readable with zero network latency', () => {
    const atmosPath = path.join(publicDir, 'textures', 'earth_atmos_2048.webp');
    const cloudsPath = path.join(publicDir, 'textures', 'earth_clouds_1024.webp');

    const atmosFd = fs.openSync(atmosPath, 'r');
    const cloudsFd = fs.openSync(cloudsPath, 'r');
    expect(atmosFd).toBeGreaterThan(0);
    expect(cloudsFd).toBeGreaterThan(0);
    fs.closeSync(atmosFd);
    fs.closeSync(cloudsFd);
  });
});
