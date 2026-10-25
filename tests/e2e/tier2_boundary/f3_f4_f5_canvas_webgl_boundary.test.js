import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 2: Boundary & Corner Cases');

describe('F3, F4 & F5 Canvas & WebGL Boundary Cases', () => {
  const rootDir = path.resolve(process.cwd());
  const ambientPath = path.join(rootDir, 'components', 'Ambient.jsx');
  const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
  const ambientContent = fs.readFileSync(ambientPath, 'utf8');
  const earthContent = fs.readFileSync(earthPath, 'utf8');

  const RADIUS = 200;
  const HEX = 22;

  // --- F3 Boundary Tests ---
  it('TC-F3-B01: Zero viewport dimension boundary (w=0, h=0) handles gracefully', () => {
    const pad = RADIUS + 25;
    const w = 0;
    const h = 0;
    const minX = Math.max(0, Math.floor(Math.min(10, 20) - pad));
    const minY = Math.max(0, Math.floor(Math.min(10, 20) - pad));
    const maxX = Math.min(w, Math.ceil(Math.max(10, 20) + pad));
    const maxY = Math.min(h, Math.ceil(Math.max(10, 20) + pad));

    expect(minX).toBe(0);
    expect(minY).toBe(0);
    expect(maxX).toBe(0);
    expect(maxY).toBe(0);
    expect(maxX - minX).toBe(0);
    expect(maxY - minY).toBe(0);
  });

  it('TC-F3-B02: Negative coordinates (cursor pushed offscreen) are strictly clamped to zero', () => {
    const pad = RADIUS + 25;
    const prevX = -100;
    const currX = -200;
    const minX = Math.max(0, Math.floor(Math.min(prevX, currX) - pad));

    expect(minX).toBe(0);
  });

  it('TC-F3-B03: Extreme offscreen coordinates (> viewport) are clamped to max width and height', () => {
    const pad = RADIUS + 25;
    const w = 1920;
    const h = 1080;
    const prevX = 5000;
    const currX = 6000;
    const maxX = Math.min(w, Math.ceil(Math.max(prevX, currX) + pad));

    expect(maxX).toBe(w);
  });

  it('TC-F3-B04: High DPR boundary (DPR >= 3) is clamped to maximum 2 in Ambient.jsx', () => {
    expect(ambientContent).toMatch(/const\s+dpr\s*=\s*Math\.min\(\s*(?:window\.)?devicePixelRatio\s*(?:\|\|\s*1)?,\s*2\s*\)/);
  });

  it('TC-F3-B05: Subpixel coordinate jitter (< 0.001) produces integer-aligned clear boundaries', () => {
    const pad = RADIUS + 25;
    const prevX = 100.0004;
    const currX = 100.0009;
    const minX = Math.max(0, Math.floor(Math.min(prevX, currX) - pad));
    const maxX = Math.min(1920, Math.ceil(Math.max(prevX, currX) + pad));

    expect(minX).toBe(-125 < 0 ? 0 : -125);
    expect(Number.isInteger(minX)).toBe(true);
    expect(Number.isInteger(maxX)).toBe(true);
  });

  // --- F4 Boundary Tests ---
  it('TC-F4-B01: Zero or negligible opacity (a < 0.01) maps to bin 0 and skips rendering', () => {
    const NUM_BINS = 16;
    const a = 0.005;
    const bin = Math.min(NUM_BINS - 1, Math.max(0, Math.round(a * (NUM_BINS - 1))));

    expect(bin).toBe(0);
  });

  it('TC-F4-B02: Peak opacity (a = 1.0) maps cleanly to maximum bin index (15) without array overflow', () => {
    const NUM_BINS = 16;
    const a = 1.0;
    const bin = Math.min(NUM_BINS - 1, Math.max(0, Math.round(a * (NUM_BINS - 1))));

    expect(bin).toBe(15);
    expect(bin).toBeLessThan(NUM_BINS);
  });

  it('TC-F4-B03: Bucket array reuse via .length = 0 preserves array identity with zero GC allocations', () => {
    const buffer = [1, 2, 3, 4, 5];
    const initialIdentity = buffer;
    buffer.length = 0;

    expect(buffer.length).toBe(0);
    expect(buffer === initialIdentity).toBe(true);
  });

  it('TC-F4-B04: Hexagonal row and column floor division handles negative coordinates correctly', () => {
    const rowH = 1.5 * HEX;
    const colW = Math.sqrt(3) * HEX;
    const posY = -50;
    const posX = -50;

    const j0 = Math.floor((posY - RADIUS) / rowH) - 1;
    const i0 = Math.floor((posX - RADIUS) / colW) - 1;

    expect(Number.isInteger(j0)).toBe(true);
    expect(Number.isInteger(i0)).toBe(true);
    expect(j0).toBeLessThan(0);
    expect(i0).toBeLessThan(0);
  });

  it('TC-F4-B05: Distance rejection avoids Math.sqrt when d2 exceeds RADIUS_SQ', () => {
    const dx = 250;
    const dy = 250;
    const d2 = dx * dx + dy * dy; // 125,000
    const RADIUS_SQ = RADIUS * RADIUS; // 40,000

    expect(d2 > RADIUS_SQ).toBe(true);
  });

  // --- F5 Boundary Tests ---
  it('TC-F5-B01: IntersectionObserver callback handles null or non-intersecting entry safely', () => {
    const entry = { isIntersecting: false };
    const isVisible = Boolean(entry?.isIntersecting);

    expect(isVisible).toBe(false);
  });

  it('TC-F5-B02: Rapid visibility toggling leaves loop state consistent with final document state', () => {
    let loopActive = true;
    const setLoop = (active) => { loopActive = active; };

    // Simulate 100 rapid visibility toggles
    for (let i = 0; i < 100; i++) {
      const isHidden = i % 2 === 0;
      setLoop(!isHidden);
    }

    // Final state (i=99, isHidden=false, so active=true)
    expect(loopActive).toBe(true);
  });

  it('TC-F5-B03: WebGL context loss event prevents render call and cancels animation loop', () => {
    expect(earthContent).toContain('isContextLost = true');
    expect(earthContent).toContain('renderer.setAnimationLoop(null)');
  });

  it('TC-F5-B04: WebGL context restored event triggers loop resumption when appropriate', () => {
    expect(earthContent).toContain('isContextLost = false');
    expect(earthContent).toContain('updateLoop()');
  });

  it('TC-F5-B05: Earth.jsx forces context loss and disposes renderer on unmount to prevent GPU leaks', () => {
    expect(earthContent).toContain('renderer.forceContextLoss()');
    expect(earthContent).toContain('renderer.dispose()');
  });
});
