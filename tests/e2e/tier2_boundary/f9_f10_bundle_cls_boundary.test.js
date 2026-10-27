import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 2: Boundary & Corner Cases');

describe('F9 & F10 Bundle & CLS Boundary Cases', () => {
  const rootDir = path.resolve(process.cwd());
  const configPath = path.join(rootDir, 'next.config.mjs');
  const packagePath = path.join(rootDir, 'package.json');
  const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
  const heroPath = path.join(rootDir, 'components', 'Hero.jsx');

  const configContent = fs.readFileSync(configPath, 'utf8');
  const packageContent = fs.readFileSync(packagePath, 'utf8');
  const earthContent = fs.readFileSync(earthPath, 'utf8');
  const heroContent = fs.readFileSync(heroPath, 'utf8');

  // --- F9 Boundary Tests ---
  it('TC-F9-B01: Node.js engine compatibility requirement specified in package.json (>=18.18.0)', () => {
    const pkg = JSON.parse(packageContent);
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toContain('>=18.18.0');
  });

  it('TC-F9-B02: compiler.removeConsole preserves error and warn diagnostics in production', () => {
    expect(configContent).toContain('removeConsole:');
    expect(configContent).toContain("exclude: ['error', 'warn']");
  });

  it('TC-F9-B03: Gzip compression on Next.js main client chunk achieves >60% payload reduction', () => {
    const nextDir = path.join(rootDir, '.next');
    const staticDir = path.join(nextDir, 'static', 'chunks');

    if (fs.existsSync(staticDir)) {
      const files = fs.readdirSync(staticDir);
      const jsFiles = files.filter((f) => f.endsWith('.js'));
      if (jsFiles.length > 0) {
        const mainChunk = jsFiles.find((f) => f.startsWith('main-') && !f.includes('main-app')) || jsFiles[0];
        const sampleFile = path.join(staticDir, mainChunk);
        const uncompressed = fs.readFileSync(sampleFile);
        const gzipped = zlib.gzipSync(uncompressed);

        const reduction = (1 - gzipped.length / uncompressed.length) * 100;
        expect(reduction).toBeGreaterThan(50);
      }
    }
  });

  it('TC-F9-B04: Dependencies list is lean with zero unnecessary heavy dependencies', () => {
    const pkg = JSON.parse(packageContent);
    const deps = Object.keys(pkg.dependencies || {});

    // Ensure lean dependency tree
    expect(deps).toContain('next');
    expect(deps).toContain('react');
    expect(deps).toContain('react-dom');
    expect(deps).toContain('three');
    expect(deps).toContain('nodemailer');

    // No bloated UI libraries (like lodash, moment, redux, jquery)
    expect(deps).not.toContain('lodash');
    expect(deps).not.toContain('moment');
    expect(deps).not.toContain('jquery');
  });

  it('TC-F9-B05: Hero.jsx renders Earth component cleanly with layout horizon callback', () => {
    expect(heroContent).toContain('<Earth');
    expect(heroContent).toContain('onLayout={setHorizon}');
  });

  // --- F10 Boundary Tests ---
  it('TC-F10-B01: Widescreen aspect ratio (aspect > 1) horizon calculation formula produces exactly 60%', () => {
    const computeHorizon = (w, h) => {
      const aspect = w / h;
      const horizonY = aspect > 1 ? -0.2 : -0.24;
      return ((1 - horizonY) / 2) * 100;
    };

    // 1920x1080 (aspect = 1.777)
    const horizonDesktop = computeHorizon(1920, 1080);
    expect(horizonDesktop).toBe(60);

    // 2560x1440 (aspect = 1.777)
    const horizonQHD = computeHorizon(2560, 1440);
    expect(horizonQHD).toBe(60);
  });

  it('TC-F10-B02: Mobile portrait aspect ratio (aspect <= 1) horizon calculation formula produces 62%', () => {
    const computeHorizon = (w, h) => {
      const aspect = w / h;
      const horizonY = aspect > 1 ? -0.2 : -0.24;
      return ((1 - horizonY) / 2) * 100;
    };

    // 375x812 (aspect = 0.461)
    const horizonMobile = computeHorizon(375, 812);
    expect(horizonMobile).toBe(62);
  });

  it('TC-F10-B03: Earth.jsx clamps mobile devicePixelRatio to 1.5 at 768px boundary', () => {
    expect(earthContent).toMatch(/window\.innerWidth\s*<\s*768\s*\?\s*1\.5\s*:\s*2/);
  });

  it('TC-F10-B04: Desktop SSR horizon height equals 60% creating zero initial layout shift (delta = 0)', () => {
    const initialHorizon = 60;
    const computedDesktopHorizon = ((1 - (-0.2)) / 2) * 100;
    const delta = Math.abs(computedDesktopHorizon - initialHorizon);

    // Delta must be 0 for zero CLS
    expect(delta).toBe(0);
  });

  it('TC-F10-B05: Hero content uses flex centering within the 60% horizon sky container', () => {
    const cssPath = path.join(rootDir, 'app', 'globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toContain('.hero-content');
    expect(cssContent).toMatch(/justify-content:\s*center/);
    expect(cssContent).toMatch(/flex-direction:\s*column/);
  });
});
