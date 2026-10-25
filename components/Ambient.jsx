'use client';

import { useEffect, useRef } from 'react';

const HEX = 22; // honeycomb cell radius
const HEX_R = HEX - 2; // 20
const RADIUS = 200; // how far the cursor's influence reaches
const RADIUS_SQ = RADIUS * RADIUS; // 40000
const SQ3 = Math.sqrt(3);
const ROW_H = 1.5 * HEX;
const COL_W = SQ3 * HEX;
const TILT_SELECTOR = '.card, .pillar, .vcard, .partner';
const MAX_TILT = 7; // degrees

// Precomputed 6 hexagon vertex offsets (zero trig calls in loop)
const HEX_DX = [
  HEX_R * (SQ3 / 2),
  HEX_R * (SQ3 / 2),
  0,
  -HEX_R * (SQ3 / 2),
  -HEX_R * (SQ3 / 2),
  0,
];
const HEX_DY = [
  -HEX_R * 0.5,
  HEX_R * 0.5,
  HEX_R,
  HEX_R * 0.5,
  -HEX_R * 0.5,
  -HEX_R,
];

// Precomputed opacity lookup tables (16 bins, zero string allocations)
const NUM_BINS = 16;
const STROKE_WIDE = new Array(NUM_BINS);
const STROKE_THIN = new Array(NUM_BINS);
for (let b = 0; b < NUM_BINS; b += 1) {
  const normA = b / (NUM_BINS - 1);
  STROKE_WIDE[b] = `rgba(110, 180, 250, ${(normA * 0.14).toFixed(3)})`;
  STROKE_THIN[b] = `rgba(70, 145, 225, ${(normA * 0.45).toFixed(3)})`;
}

/** A small molecule outline: a hexagon ring with a couple of bonded atoms. */
function Molecule({ className }) {
  return (
    <svg className={`molecule ${className}`} viewBox="0 0 120 120">
      <path d="M60 22l33 19v38L60 98 27 79V41z" />
      <path d="M93 41l18-10M27 79L9 89M60 22V4" />
      <circle cx="111" cy="31" r="5" />
      <circle cx="9" cy="89" r="5" />
      <circle cx="60" cy="4" r="4" />
    </svg>
  );
}

function hexPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let k = 0; k < 6; k += 1) {
    const a = (Math.PI / 3) * k - Math.PI / 6;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Page-wide ambient layer: drifting light-blue clouds, floating molecules, and a
 * softly glowing honeycomb that follows the cursor (or wanders on touch screens).
 * Also gives cards a gentle 3D tilt.
 */
export default function Ambient() {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    if (!canvas || !glow) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let half = 320; // half the glow size, read from CSS
    let needsFullClear = true;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      half = glow.offsetWidth / 2 || 320;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsFullClear = true;
    };
    resize();

    const target = { x: w * 0.7, y: h * 0.35 };
    const pos = { ...target };
    const prevPos = { ...target };
    let lastMove = -Infinity;
    let strength = 0.6;

    const placeGlow = () => {
      glow.style.transform = `translate3d(${pos.x - half}px, ${pos.y - half}px, 0)`;
    };

    if (reduce) {
      placeGlow();
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }

    // Preallocated bucket coordinate buffers (zero allocation in loop)
    const bins = Array.from({ length: NUM_BINS }, () => []);

    /* Softly glowing honeycomb around the cursor, with a gentle pulse rippling outward */
    const drawHoneycomb = (t) => {
      if (needsFullClear) {
        ctx.clearRect(0, 0, w, h);
        needsFullClear = false;
      } else {
        const pad = RADIUS + 26;
        const minX = Math.max(0, Math.floor(Math.min(prevPos.x, pos.x) - pad));
        const minY = Math.max(0, Math.floor(Math.min(prevPos.y, pos.y) - pad));
        const maxX = Math.min(w, Math.ceil(Math.max(prevPos.x, pos.x) + pad));
        const maxY = Math.min(h, Math.ceil(Math.max(prevPos.y, pos.y) + pad));
        ctx.clearRect(minX, minY, maxX - minX, maxY - minY);
      }
      prevPos.x = pos.x;
      prevPos.y = pos.y;

      // Clear bucket lists without allocating memory
      for (let b = 1; b < NUM_BINS; b += 1) {
        bins[b].length = 0;
      }

      const j0 = Math.floor((pos.y - RADIUS) / ROW_H) - 1;
      const j1 = Math.ceil((pos.y + RADIUS) / ROW_H) + 1;

      for (let j = j0; j <= j1; j += 1) {
        const offset = j & 1 ? COL_W / 2 : 0;
        const i0 = Math.floor((pos.x - RADIUS - offset) / COL_W) - 1;
        const i1 = Math.ceil((pos.x + RADIUS - offset) / COL_W) + 1;
        for (let i = i0; i <= i1; i += 1) {
          const cx = i * COL_W + offset;
          const cy = j * ROW_H;
          const dx = cx - pos.x;
          const dy = cy - pos.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > RADIUS_SQ) continue;

          const d = Math.sqrt(d2);
          const f = 1 - d / RADIUS;
          const e = f * f * (3 - 2 * f); // smooth falloff
          const wave = 0.6 + 0.4 * Math.sin(d * 0.045 - t * 0.0035);
          const a = e * wave * strength;
          const bin = Math.min(NUM_BINS - 1, Math.max(0, Math.round(a * (NUM_BINS - 1))));
          if (bin > 0) {
            bins[bin].push(cx, cy);
          }
        }
      }

      // Batch-draw by opacity bin: at most 15 path batches and 30 stroke calls
      for (let b = 1; b < NUM_BINS; b += 1) {
        const pts = bins[b];
        const len = pts.length;
        if (len === 0) continue;

        ctx.beginPath();
        for (let k = 0; k < len; k += 2) {
          const hx = pts[k];
          const hy = pts[k + 1];
          ctx.moveTo(hx + HEX_DX[0], hy + HEX_DY[0]);
          ctx.lineTo(hx + HEX_DX[1], hy + HEX_DY[1]);
          ctx.lineTo(hx + HEX_DX[2], hy + HEX_DY[2]);
          ctx.lineTo(hx + HEX_DX[3], hy + HEX_DY[3]);
          ctx.lineTo(hx + HEX_DX[4], hy + HEX_DY[4]);
          ctx.lineTo(hx + HEX_DX[5], hy + HEX_DY[5]);
          ctx.closePath();
        }

        // soft wide stroke + thin stroke = a gentle blue glow
        ctx.lineWidth = 5;
        ctx.strokeStyle = STROKE_WIDE[b];
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = STROKE_THIN[b];
        ctx.stroke();
      }
    };

    let frame = 0;
    let tick = 0;
    const loop = (t) => {
      frame = requestAnimationFrame(loop);
      tick += 1;
      const following = performance.now() - lastMove < 2500;
      if (!following) {
        // wander slowly when the cursor is idle or on touch screens
        target.x = w * (0.5 + 0.36 * Math.sin(t * 0.00016));
        target.y = h * (0.45 + 0.3 * Math.sin(t * 0.00023 + 1.3));
        if (!finePointer && tick % 2) return; // half rate on touch devices to save battery
      }
      strength += ((following ? 1 : 0.6) - strength) * 0.05;
      const k = following ? 0.14 : 0.02;
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      placeGlow();
      drawHoneycomb(t);
    };

    let lastTilted = null;
    let pendingTilt = null;
    let tiltFrame = 0;
    const applyTilt = () => {
      tiltFrame = 0;
      if (!pendingTilt) return;
      const { el, clientX, clientY } = pendingTilt;
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width - 0.5;
      const py = (clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${(px * MAX_TILT * 2).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-py * MAX_TILT * 2).toFixed(2)}deg`);
    };

    const resetTilt = (el) => {
      if (!el) return;
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--rx', '0deg');
    };

    const onPointerMove = (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        target.x = e.clientX;
        target.y = e.clientY;
        lastMove = performance.now();
      }

      // 3D tilt for cards under the cursor - coalesced to RAF to eliminate mouse polling jank
      if (!finePointer) return;
      const el = e.target instanceof Element ? e.target.closest(TILT_SELECTOR) : null;
      if (el) {
        if (lastTilted && lastTilted !== el) {
          resetTilt(lastTilted);
        }
        lastTilted = el;
        pendingTilt = { el, clientX: e.clientX, clientY: e.clientY };
        if (!tiltFrame) tiltFrame = requestAnimationFrame(applyTilt);
      } else if (lastTilted) {
        resetTilt(lastTilted);
        lastTilted = null;
        pendingTilt = null;
      }
    };

    const onPointerLeave = () => {
      if (lastTilted) {
        resetTilt(lastTilted);
        lastTilted = null;
        pendingTilt = null;
      }
    };

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      if (!document.hidden) {
        needsFullClear = true;
        frame = requestAnimationFrame(loop);
      }
    };

    frame = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      if (tiltFrame) cancelAnimationFrame(tiltFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-cloud c1" />
      <div className="ambient-cloud c2" />
      <div className="ambient-cloud c3" />
      <div className="ambient-cloud c4" />
      <div className="ambient-cloud c5" />
      <div ref={glowRef} className="ambient-glow" />
      <canvas ref={canvasRef} className="ambient-canvas" />
      <Molecule className="m1" />
      <Molecule className="m2" />
      <Molecule className="m3" />
      <Molecule className="m4" />
    </div>
  );
}
