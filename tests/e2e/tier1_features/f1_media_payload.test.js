import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F1: Image Media Optimization', () => {
  const rootDir = path.resolve(process.cwd());
  const publicDir = path.join(rootDir, 'public');

  const assetPairs = [
    { orig: 'images/founder.png', webp: 'images/founder.webp', width: 800, height: 800 },
    { orig: 'images/neutralize.jpg', webp: 'images/neutralize.webp', width: 1376, height: 768 },
    { orig: 'images/preserve.jpg', webp: 'images/preserve.webp', width: 1376, height: 768 },
    { orig: 'images/stop.jpg', webp: 'images/stop.webp', width: 1376, height: 768 },
    { orig: 'textures/earth_atmos_2048.jpg', webp: 'textures/earth_atmos_2048.webp', width: 2048, height: 1024 },
    { orig: 'textures/earth_clouds_1024.png', webp: 'textures/earth_clouds_1024.webp', width: 1024, height: 512 },
  ];

  // Baseline uncompressed/original asset byte count measured in explorer_survey_1
  const BASELINE_TOTAL_BYTES = 3741427; // ~3.74 MB

  it('TC-F1-01: Aggregate media asset payload achieves >65% reduction and >2.0 MB saved', () => {
    let totalWebpBytes = 0;
    for (const pair of assetPairs) {
      const fullPath = path.join(publicDir, pair.webp);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      totalWebpBytes += stat.size;
    }

    const savedBytes = BASELINE_TOTAL_BYTES - totalWebpBytes;
    const reductionPercent = (savedBytes / BASELINE_TOTAL_BYTES) * 100;

    // Must save > 2,000,000 bytes (2.0 MB)
    expect(savedBytes).toBeGreaterThan(2000000);
    // Must achieve > 65% reduction
    expect(reductionPercent).toBeGreaterThan(65);
    // Measured payload should be <= 1,100,000 bytes (~1.05 MB)
    expect(totalWebpBytes).toBeLessThanOrEqual(1100000);
  });

  it('TC-F1-02: Next-generation WebP variants exist on filesystem for all core media assets', () => {
    for (const pair of assetPairs) {
      const fullPath = path.join(publicDir, pair.webp);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(1000); // non-trivial valid payload
    }
  });

  it('TC-F1-03: WebP asset pixel dimensions match design specification exactly', async () => {
    for (const pair of assetPairs) {
      const fullPath = path.join(publicDir, pair.webp);
      const metadata = await sharp(fullPath).metadata();
      expect(metadata.format).toBe('webp');
      expect(metadata.width).toBe(pair.width);
      expect(metadata.height).toBe(pair.height);
    }
  });

  it('TC-F1-04: Story.jsx and Founder.jsx reference optimized WebP paths without legacy formats', () => {
    const storyPath = path.join(rootDir, 'components', 'Story.jsx');
    const founderPath = path.join(rootDir, 'components', 'Founder.jsx');

    const storyContent = fs.readFileSync(storyPath, 'utf8');
    const founderContent = fs.readFileSync(founderPath, 'utf8');

    // Verify Story.jsx references WebP
    expect(storyContent).toContain('neutralize.webp');
    expect(storyContent).toContain('preserve.webp');
    expect(storyContent).toContain('stop.webp');
    // Verify Story.jsx does NOT reference legacy JPG
    expect(storyContent).not.toContain('neutralize.jpg');
    expect(storyContent).not.toContain('preserve.jpg');
    expect(storyContent).not.toContain('stop.jpg');

    // Verify Founder.jsx references WebP
    expect(founderContent).toContain('founder.webp');
  });

  it('TC-F1-05: WebP files exhibit valid RIFF/WEBP binary header signatures and structure', () => {
    for (const pair of assetPairs) {
      const fullPath = path.join(publicDir, pair.webp);
      const buffer = fs.readFileSync(fullPath);

      // Check RIFF magic bytes: 0x52, 0x49, 0x46, 0x46
      const riffHeader = buffer.subarray(0, 4).toString('ascii');
      expect(riffHeader).toBe('RIFF');

      // Check WEBP magic bytes at offset 8: 0x57, 0x45, 0x42, 0x50
      const webpHeader = buffer.subarray(8, 12).toString('ascii');
      expect(webpHeader).toBe('WEBP');

      // Check valid VP8 / VP8X chunk
      const chunkHeader = buffer.subarray(12, 16).toString('ascii');
      const isValidChunk = chunkHeader.startsWith('VP8');
      expect(isValidChunk).toBe(true);
    }
  });
});
