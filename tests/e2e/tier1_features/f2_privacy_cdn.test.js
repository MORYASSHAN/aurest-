import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F2: Local Texture Serving & Zero CDN Leaks', () => {
  const rootDir = path.resolve(process.cwd());

  it('TC-F2-01: Earth textures exist locally in public/textures/ folder', () => {
    const atmosPath = path.join(rootDir, 'public', 'textures', 'earth_atmos_2048.webp');
    const cloudsPath = path.join(rootDir, 'public', 'textures', 'earth_clouds_1024.webp');

    expect(fs.existsSync(atmosPath)).toBe(true);
    expect(fs.existsSync(cloudsPath)).toBe(true);

    const atmosSize = fs.statSync(atmosPath).size;
    const cloudsSize = fs.statSync(cloudsPath).size;
    expect(atmosSize).toBeGreaterThan(100000);
    expect(cloudsSize).toBeGreaterThan(50000);
  });

  it('TC-F2-02: Earth.jsx loads textures exclusively via local same-origin paths without external protocols', () => {
    const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
    const earthContent = fs.readFileSync(earthPath, 'utf8');

    // Verify local TEXTURE_BASE
    expect(earthContent).toContain("const TEXTURE_BASE = '/textures/';");
    // Verify no http or https in texture loading
    expect(earthContent).not.toMatch(/TEXTURE_BASE\s*=\s*['"]https?:\/\//);
    // Verify loading earth_atmos_2048.webp and earth_clouds_1024.webp
    expect(earthContent).toContain('earth_atmos_2048.webp');
    expect(earthContent).toContain('earth_clouds_1024.webp');
  });

  it('TC-F2-03: Zero occurrences of third-party CDN hostnames across codebase source files', () => {
    const forbiddenCDNs = ['cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com'];
    const searchDirs = ['app', 'components', 'lib'];

    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (/\.(jsx?|tsx?|css|json|mjs)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const cdn of forbiddenCDNs) {
            expect(content.includes(cdn)).toBe(false);
          }
        }
      }
    };

    for (const d of searchDirs) {
      scanDirectory(path.join(rootDir, d));
    }
  });

  it('TC-F2-04: Typography/fonts are self-hosted locally via next/font/google with zero external font runtime requests', () => {
    const layoutPath = path.join(rootDir, 'app', 'layout.js');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    // Verifies Next.js internal font self-hosting
    expect(layoutContent).toContain("import { Manrope } from 'next/font/google'");
    expect(layoutContent).toContain("display: 'swap'");
    expect(layoutContent).toContain("variable: '--font-manrope'");

    // Verifies no external font link tags in layout or html
    expect(layoutContent).not.toContain('fonts.googleapis.com');
    expect(layoutContent).not.toContain('fonts.gstatic.com');
  });

  it('TC-F2-05: CSP in next.config.mjs eliminates Unsplash and restricts img-src to self, blob, data', () => {
    const configPath = path.join(rootDir, 'next.config.mjs');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Assert images.unsplash.com is completely absent
    expect(configContent).not.toContain('images.unsplash.com');

    // Assert img-src policy is self, blob, data
    expect(configContent).toMatch(/img-src\s+'self'\s+blob:\s+data:/);
  });
});
