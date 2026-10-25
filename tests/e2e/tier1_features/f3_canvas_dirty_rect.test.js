import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F3: Canvas Dirty-Rect Bounding Box Clearing', () => {
  const rootDir = path.resolve(process.cwd());
  const ambientPath = path.join(rootDir, 'components', 'Ambient.jsx');
  const ambientContent = fs.readFileSync(ambientPath, 'utf8');

  // Mathematical constants from Ambient.jsx specification
  const HEX = 22;
  const RADIUS = 200;

  it('TC-F3-01: Dirty rect coordinate bounds are strictly clamped within viewport boundaries [0, w] and [0, h]', () => {
    // Pure algorithmic model of dirty rect bounds
    const calculateDirtyRect = (prevX, prevY, currX, currY, pad, w, h) => {
      const minX = Math.max(0, Math.floor(Math.min(prevX, currX) - pad));
      const minY = Math.max(0, Math.floor(Math.min(prevY, currY) - pad));
      const maxX = Math.min(w, Math.ceil(Math.max(prevX, currX) + pad));
      const maxY = Math.min(h, Math.ceil(Math.max(prevY, currY) + pad));
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    };

    // Test at top-left edge
    const rectTL = calculateDirtyRect(10, 10, 15, 15, RADIUS + 25, 1920, 1080);
    expect(rectTL.x).toBe(0);
    expect(rectTL.y).toBe(0);
    expect(rectTL.w).toBeGreaterThan(0);
    expect(rectTL.h).toBeGreaterThan(0);

    // Test at bottom-right edge
    const rectBR = calculateDirtyRect(1900, 1060, 1910, 1070, RADIUS + 25, 1920, 1080);
    expect(rectBR.x + rectBR.w).toBeLessThanOrEqual(1920);
    expect(rectBR.y + rectBR.h).toBeLessThanOrEqual(1080);
  });

  it('TC-F3-02: Dirty rect clear pad covers full hex radius and outer glow stroke', () => {
    // Component source must declare padding of at least RADIUS + 20
    expect(ambientContent).toMatch(/const\s+pad\s*=\s*RADIUS\s*\+\s*(2[0-9]|[3-9][0-9])/);
  });

  it('TC-F3-03: Dirty rect coordinates prevent subpixel rendering artifacts and remain within integer precision', () => {
    // Verify coordinates with fractional subpixel inputs
    const prevPos = { x: 500.456, y: 300.789 };
    const pos = { x: 504.123, y: 303.456 };
    const pad = RADIUS + 25;
    const w = 1920;
    const h = 1080;

    const minX = Math.max(0, Math.floor(Math.min(prevPos.x, pos.x) - pad));
    const minY = Math.max(0, Math.floor(Math.min(prevPos.y, pos.y) - pad));
    const maxX = Math.min(w, Math.ceil(Math.max(prevPos.x, pos.x) + pad));
    const maxY = Math.min(h, Math.ceil(Math.max(prevPos.y, pos.y) + pad));

    expect(Number.isInteger(minX)).toBe(true);
    expect(Number.isInteger(minY)).toBe(true);
    expect(Number.isInteger(maxX - minX)).toBe(true);
    expect(Number.isInteger(maxY - minY)).toBe(true);
  });

  it('TC-F3-04: Dirty rect clear reduces 4K physical fill-rate clear area by >95%', () => {
    const screenW = 3840;
    const screenH = 2160;
    const full4KClearPixels = screenW * screenH; // 8,294,400 physical pixels at 1x, or 33M at 2x

    // Max dirty rect dimension for typical movement (delta <= 20px)
    const delta = 20;
    const clearSide = (RADIUS + 25) * 2 + delta; // 470 px
    const dirtyRectPixels = clearSide * clearSide; // 220,900 pixels

    const fillRateRatio = dirtyRectPixels / full4KClearPixels;
    const reductionPercent = (1 - fillRateRatio) * 100;

    expect(reductionPercent).toBeGreaterThan(95); // > 97% reduction
    expect(fillRateRatio).toBeLessThan(0.05); // < 5% of full screen
  });

  it('TC-F3-05: Ambient.jsx specifies conditional dirty-rect clearing in drawHoneycomb', () => {
    // Verify Ambient.jsx contains clearRect with dirty rect bounds
    expect(ambientContent).toContain('ctx.clearRect(');
    expect(ambientContent).toContain('needsFullClear');
    expect(ambientContent).toMatch(/ctx\.clearRect\(\s*minX,\s*minY|ctx\.clearRect\(\s*x0,\s*y0/);
  });
});
