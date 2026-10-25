import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F9: Next.js Three.js Tree-Shaking & Bundle Optimization', () => {
  const rootDir = path.resolve(process.cwd());
  const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
  const configPath = path.join(rootDir, 'next.config.mjs');
  const earthContent = fs.readFileSync(earthPath, 'utf8');
  const configContent = fs.readFileSync(configPath, 'utf8');

  it('TC-F9-01: Earth.jsx utilizes explicit named Three.js imports instead of wildcard imports', () => {
    // Assert no wildcard import * as THREE
    expect(earthContent).not.toMatch(/import\s+\*\s+as\s+THREE\s+from\s+['"]three['"]/);

    // Assert explicit named imports
    expect(earthContent).toContain("from 'three'");
    expect(earthContent).toContain('WebGLRenderer');
    expect(earthContent).toContain('OrthographicCamera');
    expect(earthContent).toContain('TextureLoader');
    expect(earthContent).toContain('ShaderMaterial');
    expect(earthContent).toContain('SphereGeometry');
    expect(earthContent).toContain('Mesh');
  });

  it('TC-F9-02: next.config.mjs configures optimizePackageImports for three', () => {
    expect(configContent).toContain("optimizePackageImports: ['three']");
  });

  it('TC-F9-03: next.config.mjs enables HTTP response compression', () => {
    expect(configContent).toContain('compress: true');
  });

  it('TC-F9-04: Production build artifacts exist in .next/ directory', () => {
    const nextDir = path.join(rootDir, '.next');
    expect(fs.existsSync(nextDir)).toBe(true);

    const staticDir = path.join(nextDir, 'static');
    expect(fs.existsSync(staticDir)).toBe(true);

    const buildManifest = path.join(nextDir, 'build-manifest.json');
    expect(fs.existsSync(buildManifest)).toBe(true);
  });

  it('TC-F9-05: Production First Load JS size for index route is within budget (< 200 kB)', () => {
    const nextDir = path.join(rootDir, '.next');
    const buildManifestPath = path.join(nextDir, 'build-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));

    const rootFiles = manifest.pages['/'] || [];
    let totalBytes = 0;
    for (const f of rootFiles) {
      const filePath = path.join(nextDir, f);
      if (fs.existsSync(filePath)) {
        totalBytes += fs.statSync(filePath).size;
      }
    }

    // Budget check: under 200,000 bytes uncompressed
    expect(totalBytes).toBeLessThan(200000);
  });
});
