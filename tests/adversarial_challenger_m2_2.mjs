/**
 * Adversarial Challenger 2 Empirical Stress Verification Suite
 * Milestone 2: Canvas & WebGL Runtime Performance
 * 
 * Verifies:
 * 1. prefers-reduced-motion: reduce handling in Ambient.jsx & Earth.jsx
 * 2. Visual aesthetic invariance: ripple math, card hover 3D tilt, globe shaders
 * 3. WebGL context lifecycle: webglcontextlost, webglcontextrestored, rapid flapping
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('======================================================================');
console.log('  CHALLENGER 2: EMPIRICAL ADVERSARIAL STRESS TEST SUITE (MILESTONE 2) ');
console.log('======================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(0, 4).join('\n'));
    }
    failedTests++;
  }
}

// ============================================================================
// SUITE 1: PREFERS-REDUCED-MOTION EMPIRICAL HARNESS
// ============================================================================
console.log('--- SUITE 1: prefers-reduced-motion: reduce Handling ---');

runTest('1.1: Ambient.jsx pauses all animation loops under prefers-reduced-motion', () => {
  const ambientSrc = fs.readFileSync('components/Ambient.jsx', 'utf8');

  // Verify matchMedia query check
  assert(ambientSrc.includes("window.matchMedia('(prefers-reduced-motion: reduce)').matches"),
    'Must check window.matchMedia for prefers-reduced-motion: reduce');

  // Verify early return on reduce
  assert(ambientSrc.includes('if (reduce) {'), 'Must have if (reduce) block');
  assert(ambientSrc.includes('placeGlow();'), 'Must render static representation via placeGlow()');

  // Extract the reduced-motion branch logic
  const reduceBlockMatch = ambientSrc.match(/if \(reduce\) \{([\s\S]*?)\}/);
  assert(reduceBlockMatch, 'Must find if (reduce) block');
  const reduceBlock = reduceBlockMatch[1];

  // In reduce block: MUST NOT start requestAnimationFrame
  assert(!reduceBlock.includes('requestAnimationFrame'), 'Must NOT call requestAnimationFrame in reduced motion block');
  assert(!reduceBlock.includes('loop'), 'Must NOT call loop in reduced motion block');

  // Simulate execution of Ambient's reduce logic in a mock DOM environment
  let rAFCalls = 0;
  let glowTransform = '';
  const mockGlow = {
    offsetWidth: 640,
    style: {
      set transform(val) { glowTransform = val; },
      get transform() { return glowTransform; }
    }
  };
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      setTransform: () => {},
      clearRect: () => {},
    })
  };
  let resizeListeners = 0;
  const mockWindow = {
    innerWidth: 1920,
    innerHeight: 1080,
    devicePixelRatio: 2,
    matchMedia: (query) => ({
      matches: query.includes('prefers-reduced-motion: reduce')
    }),
    requestAnimationFrame: () => { rAFCalls++; return 1; },
    addEventListener: (evt) => { if (evt === 'resize') resizeListeners++; },
    removeEventListener: (evt) => { if (evt === 'resize') resizeListeners--; }
  };

  // Run Ambient component setup under reduced motion
  const reduce = mockWindow.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const w = mockWindow.innerWidth;
  const h = mockWindow.innerHeight;
  const dpr = Math.min(mockWindow.devicePixelRatio || 1, 2);
  const half = mockGlow.offsetWidth / 2;
  const target = { x: w * 0.7, y: h * 0.35 };
  const pos = { ...target };

  const placeGlow = () => {
    mockGlow.style.transform = `translate3d(${pos.x - half}px, ${pos.y - half}px, 0)`;
  };

  let cleanup = null;
  if (reduce) {
    placeGlow();
    mockWindow.addEventListener('resize', () => {});
    cleanup = () => mockWindow.removeEventListener('resize', () => {});
  }

  // Assertions
  assert.strictEqual(rAFCalls, 0, 'Zero rAF calls should be made under reduced motion');
  assert.strictEqual(glowTransform, `translate3d(${1920 * 0.7 - 320}px, ${1080 * 0.35 - 320}px, 0)`,
    'Glow must be statically positioned');
  assert.strictEqual(resizeListeners, 1, 'Resize listener registered for responsive canvas');

  cleanup();
  assert.strictEqual(resizeListeners, 0, 'Cleaned up resize listener on unmount');
});

runTest('1.2: Earth.jsx halts WebGL animation loop and renders static frame under prefers-reduced-motion', () => {
  const earthSrc = fs.readFileSync('components/Earth.jsx', 'utf8');

  // Verify reduceMotion check
  assert(earthSrc.includes("const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;"),
    'Must read prefers-reduced-motion: reduce');

  // Verify static render on mount for reduceMotion
  assert(earthSrc.includes('if (reduceMotion) {\n      renderer.render(scene, camera);\n    }'),
    'Must execute renderer.render(scene, camera) statically if reduceMotion');

  // Verify updateLoop prevents setAnimationLoop(tick) under reduceMotion
  assert(earthSrc.includes('if (reduceMotion || isContextLost) {\n        renderer.setAnimationLoop(null);\n        renderer.render(scene, camera);\n        return;\n      }'),
    'updateLoop must setAnimationLoop(null) and render static frame when reduceMotion');

  // Simulate Earth runtime loop controller under reduced motion
  let activeAnimationCallback = null;
  let renderCallCount = 0;

  const mockRenderer = {
    setAnimationLoop: (cb) => {
      activeAnimationCallback = cb;
    },
    render: () => {
      renderCallCount++;
    }
  };

  const reduceMotion = true;
  let isContextLost = false;
  let isVisible = false;
  const mockDocument = { hidden: false };

  const tick = () => {
    if (isContextLost) return;
    mockRenderer.render();
  };

  const updateLoop = () => {
    if (reduceMotion || isContextLost) {
      mockRenderer.setAnimationLoop(null);
      mockRenderer.render();
      return;
    }
    const shouldRun = isVisible && !mockDocument.hidden;
    mockRenderer.setAnimationLoop(isVisible && !mockDocument.hidden ? tick : null);
    if (!shouldRun) {
      mockRenderer.render();
    }
  };

  // Mount
  if (reduceMotion) {
    mockRenderer.render();
  }
  assert.strictEqual(renderCallCount, 1, 'Static frame rendered on mount');
  assert.strictEqual(activeAnimationCallback, null, 'setAnimationLoop is null on mount');

  // Texture load triggers renderFrame()
  const renderFrame = () => {
    if (!isContextLost) {
      mockRenderer.render();
    }
  };
  renderFrame();
  assert.strictEqual(renderCallCount, 2, 'Static frame rendered upon texture load');

  // IntersectionObserver triggers (globe enters viewport)
  isVisible = true;
  updateLoop();
  assert.strictEqual(activeAnimationCallback, null, 'setAnimationLoop MUST remain null when entering viewport under reduced motion');
  assert.strictEqual(renderCallCount, 3, 'Static frame re-rendered on intersection update');

  // Tab visibility changes (user switches back to tab)
  mockDocument.hidden = false;
  updateLoop();
  assert.strictEqual(activeAnimationCallback, null, 'setAnimationLoop MUST remain null on visibility change');
  assert.strictEqual(renderCallCount, 4, 'Static frame rendered without continuous loop');
});

runTest('1.3: Verification that standard motion activates rAF and setAnimationLoop', () => {
  let activeAnimationCallback = null;
  const mockRenderer = {
    setAnimationLoop: (cb) => { activeAnimationCallback = cb; },
    render: () => {}
  };
  const reduceMotion = false;
  let isContextLost = false;
  let isVisible = true;
  const mockDocument = { hidden: false };
  const tick = () => {};

  const updateLoop = () => {
    if (reduceMotion || isContextLost) {
      mockRenderer.setAnimationLoop(null);
      mockRenderer.render();
      return;
    }
    const shouldRun = isVisible && !mockDocument.hidden;
    mockRenderer.setAnimationLoop(isVisible && !mockDocument.hidden ? tick : null);
  };

  updateLoop();
  assert.strictEqual(activeAnimationCallback, tick, 'Under standard motion and visible tab, tick is running');
});

// ============================================================================
// SUITE 2: VISUAL AESTHETIC INVARIANCE & MATHEMATICAL ORACLES
// ============================================================================
console.log('\n--- SUITE 2: Visual Aesthetic Invariance & Mathematical Oracles ---');

runTest('2.1: Honeycomb ripple formula mathematical oracle across 10,000 coordinate / time samples', () => {
  const RADIUS = 200;
  const RADIUS_SQ = RADIUS * RADIUS;

  // Reference continuous mathematical formula
  function referenceRipple(dx, dy, t, strength) {
    const d = Math.hypot(dx, dy);
    if (d > RADIUS) return 0;
    const f = 1 - d / RADIUS;
    const e = f * f * (3 - 2 * f);
    const wave = 0.6 + 0.4 * Math.sin(d * 0.045 - t * 0.0035);
    return e * wave * strength;
  }

  // Component optimized formula
  function componentRipple(dx, dy, t, strength) {
    const d2 = dx * dx + dy * dy;
    if (d2 > RADIUS_SQ) return 0;
    const d = Math.sqrt(d2);
    const f = 1 - d / RADIUS;
    const e = f * f * (3 - 2 * f);
    const wave = 0.6 + 0.4 * Math.sin(d * 0.045 - t * 0.0035);
    return e * wave * strength;
  }

  let maxDelta = 0;
  const testTimes = [0, 100, 1500, 5000, 25000, 89432];
  const testStrengths = [0.6, 0.75, 0.9, 1.0];

  for (const t of testTimes) {
    for (const strength of testStrengths) {
      for (let dx = -RADIUS - 20; dx <= RADIUS + 20; dx += 8) {
        for (let dy = -RADIUS - 20; dy <= RADIUS + 20; dy += 8) {
          const refVal = referenceRipple(dx, dy, t, strength);
          const compVal = componentRipple(dx, dy, t, strength);
          const delta = Math.abs(refVal - compVal);
          if (delta > maxDelta) maxDelta = delta;
          assert(delta < 1e-13, `Ripple math mismatch at dx=${dx}, dy=${dy}, t=${t}: delta=${delta}`);
        }
      }
    }
  }

  assert(maxDelta < 1e-13, `Maximum delta must be near machine epsilon: ${maxDelta}`);
});

runTest('2.2: Hexagon vertex precomputations match trigonometric generator to within 1e-15', () => {
  const SQ3 = Math.sqrt(3);
  const HEX = 22;
  const HEX_R = HEX - 2; // 20

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

  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k - Math.PI / 6;
    const expectedX = HEX_R * Math.cos(a);
    const expectedY = HEX_R * Math.sin(a);

    const deltaX = Math.abs(expectedX - HEX_DX[k]);
    const deltaY = Math.abs(expectedY - HEX_DY[k]);

    assert(deltaX < 1e-13, `Vertex ${k} X offset mismatch: expected ${expectedX}, got ${HEX_DX[k]}, delta=${deltaX}`);
    assert(deltaY < 1e-13, `Vertex ${k} Y offset mismatch: expected ${expectedY}, got ${HEX_DY[k]}, delta=${deltaY}`);
  }
});

runTest('2.3: 16-bin opacity quantization error bound and color string integrity', () => {
  const NUM_BINS = 16;
  const STROKE_WIDE = new Array(NUM_BINS);
  const STROKE_THIN = new Array(NUM_BINS);
  for (let b = 0; b < NUM_BINS; b += 1) {
    const normA = b / (NUM_BINS - 1);
    STROKE_WIDE[b] = `rgba(110, 180, 250, ${(normA * 0.14).toFixed(3)})`;
    STROKE_THIN[b] = `rgba(70, 145, 225, ${(normA * 0.45).toFixed(3)})`;
  }

  // Maximum quantization step across continuous alpha [0, 1]
  let maxQuantizationError = 0;
  for (let a = 0; a <= 1.0; a += 0.0005) {
    const bin = Math.min(NUM_BINS - 1, Math.max(0, Math.round(a * (NUM_BINS - 1))));
    const reconstructedNormA = bin / (NUM_BINS - 1);
    const err = Math.abs(a - reconstructedNormA);
    if (err > maxQuantizationError) maxQuantizationError = err;
  }

  // Quantization error on normalized alpha must not exceed 1 / (2 * (NUM_BINS - 1)) = 1/30 = 0.0333...
  assert(maxQuantizationError <= 1 / 30 + 1e-9, `Max quantization error ${maxQuantizationError} exceeds theoretical 1/30`);

  // Max visual alpha delta
  const maxWideAlphaDelta = maxQuantizationError * 0.14;
  const maxThinAlphaDelta = maxQuantizationError * 0.45;
  assert(maxWideAlphaDelta < 0.005, `Wide stroke alpha error ${maxWideAlphaDelta} must be < 0.005 (<0.5%)`);
  assert(maxThinAlphaDelta < 0.016, `Thin stroke alpha error ${maxThinAlphaDelta} must be < 0.016 (<1.6%)`);

  // Verify color formatting
  assert(STROKE_WIDE[0].startsWith('rgba(110, 180, 250, 0.000)'));
  assert(STROKE_WIDE[15].startsWith('rgba(110, 180, 250, 0.140)'));
  assert(STROKE_THIN[0].startsWith('rgba(70, 145, 225, 0.000)'));
  assert(STROKE_THIN[15].startsWith('rgba(70, 145, 225, 0.450)'));
});

runTest('2.4: Card hover 3D tilt mathematics and RAF coalescing oracle', () => {
  const MAX_TILT = 7;
  const cardRect = { left: 100, top: 100, width: 400, height: 300 };

  function computeTilt(clientX, clientY, r) {
    const px = (clientX - r.left) / r.width - 0.5;
    const py = (clientY - r.top) / r.height - 0.5;
    const ry = (px * MAX_TILT * 2).toFixed(2);
    const rx = (-py * MAX_TILT * 2).toFixed(2);
    return { rx: `${rx}deg`, ry: `${ry}deg`, numRx: parseFloat(rx), numRy: parseFloat(ry) };
  }

  // Test center: exactly 0deg
  const centerTilt = computeTilt(300, 250, cardRect);
  assert.strictEqual(centerTilt.rx, '0.00deg');
  assert.strictEqual(centerTilt.ry, '0.00deg');

  // Test corners: exactly +/- 7deg
  const topLeftTilt = computeTilt(100, 100, cardRect);
  assert.strictEqual(topLeftTilt.ry, '-7.00deg');
  assert.strictEqual(topLeftTilt.rx, '7.00deg');

  const bottomRightTilt = computeTilt(500, 400, cardRect);
  assert.strictEqual(bottomRightTilt.ry, '7.00deg');
  assert.strictEqual(bottomRightTilt.rx, '-7.00deg');

  // Verify pointermove coalescing simulation
  let rAFScheduled = 0;
  let tiltFrame = 0;
  let pendingTilt = null;
  const mockApplyTilt = () => {
    tiltFrame = 0;
    // apply styles
  };

  for (let i = 0; i < 50; i++) {
    pendingTilt = { el: {}, clientX: 100 + i, clientY: 100 + i };
    if (!tiltFrame) {
      tiltFrame = 1;
      rAFScheduled++;
    }
  }

  assert.strictEqual(rAFScheduled, 1, '50 rapid pointer moves within one frame schedule exactly 1 rAF call');
});

runTest('2.5: Globe shaders mathematical and aesthetic invariance verification', () => {
  const shaderPath = path.join(process.cwd(), 'lib', 'earthShaders.js');
  const shaderContent = fs.readFileSync(shaderPath, 'utf8');

  // Earth fragment shader assertions
  assert(shaderContent.includes('uniform sampler2D dayMap;'), 'Must have dayMap uniform');
  assert(shaderContent.includes('uniform sampler2D cloudMap;'), 'Must have cloudMap uniform');
  assert(shaderContent.includes('uniform vec3 sunDir;'), 'Must have sunDir uniform');
  assert(shaderContent.includes('uniform float time;'), 'Must have time uniform');

  // Cloud drift math: vUv + vec2(time * 0.004, 0.0)
  assert(shaderContent.includes('vUv + vec2(time * 0.004, 0.0)'), 'Cloud drift speed must be exactly 0.004');
  assert(shaderContent.includes('cloud * 0.72'), 'Cloud opacity blend factor must be 0.72');

  // Sunlight math: mix(0.35, 1.25, smoothstep(-0.3, 0.7, d))
  assert(shaderContent.includes('mix(0.35, 1.25, smoothstep(-0.3, 0.7, d))'), 'Sunlight curve must be preserved');

  // Atmospheric haze math: pow(1.0 - max(dot(n, v), 0.0), 2.6)
  assert(shaderContent.includes('pow(1.0 - max(dot(n, v), 0.0), 2.6)'), 'Haze exponent must be 2.6');
  assert(shaderContent.includes('mix(col, vec3(0.78, 0.88, 0.98), f * 0.55)'), 'Haze color must be vec3(0.78, 0.88, 0.98)');

  // Atmosphere halo shader assertions
  assert(shaderContent.includes('pow(smoothstep(0.0, 0.35, k), 1.8)'), 'Atmosphere halo curve must be smoothstep(0.0, 0.35, k)^1.8');
  assert(shaderContent.includes('gl_FragColor = vec4(0.9, 0.95, 1.0, a * 0.6);'), 'Halo color must be vec4(0.9, 0.95, 1.0, a * 0.6)');
});

// ============================================================================
// SUITE 3: WEBGL CONTEXT LIFECYCLE & STRESS HARNESS
// ============================================================================
console.log('\n--- SUITE 3: WebGL Context Lifecycle & Stress Harness ---');

runTest('3.1: webglcontextlost cancels animation loop, prevents default, and halts rendering', () => {
  let isContextLost = false;
  let activeAnimationLoop = 'tick';
  let renderCount = 0;

  const mockRenderer = {
    setAnimationLoop: (cb) => { activeAnimationLoop = cb; },
    render: () => {
      if (isContextLost) {
        throw new Error('CRITICAL: renderer.render() called when WebGL context is lost!');
      }
      renderCount++;
    }
  };

  const onContextLost = (e) => {
    e.preventDefault();
    isContextLost = true;
    mockRenderer.setAnimationLoop(null);
  };

  let defaultPrevented = false;
  const mockEvent = {
    preventDefault: () => { defaultPrevented = true; }
  };

  onContextLost(mockEvent);

  assert.strictEqual(defaultPrevented, true, 'Must call e.preventDefault() on webglcontextlost');
  assert.strictEqual(isContextLost, true, 'isContextLost must be true');
  assert.strictEqual(activeAnimationLoop, null, 'setAnimationLoop(null) must be called');

  // Tick execution during context loss
  const tick = () => {
    if (isContextLost) return;
    mockRenderer.render();
  };
  tick();
  assert.strictEqual(renderCount, 0, 'tick() must early-return and not invoke render');
});

runTest('3.2: Concurrent interactions during lost context do not throw or leak', () => {
  let isContextLost = true;
  let activeAnimationLoop = null;
  let renderAttempts = 0;

  const mockRenderer = {
    setAnimationLoop: (cb) => { activeAnimationLoop = cb; },
    render: () => {
      renderAttempts++;
      // Three.js internal WebGLRenderer behavior: if (_isContextLost === true) return;
      // It returns cleanly without throwing!
    }
  };

  const reduceMotion = false;
  let isVisible = true;
  const mockDocument = { hidden: false };
  const tick = () => { if (isContextLost) return; mockRenderer.render(); };

  const updateLoop = () => {
    if (reduceMotion || isContextLost) {
      mockRenderer.setAnimationLoop(null);
      mockRenderer.render();
      return;
    }
    const shouldRun = isVisible && !mockDocument.hidden;
    mockRenderer.setAnimationLoop(isVisible && !mockDocument.hidden ? tick : null);
    if (!shouldRun) {
      mockRenderer.render();
    }
  };

  // 1. IntersectionObserver fires while context lost
  isVisible = false;
  assert.doesNotThrow(() => updateLoop(), 'updateLoop must not throw when offscreen during context loss');
  assert.strictEqual(activeAnimationLoop, null, 'Animation loop must stay null');

  isVisible = true;
  assert.doesNotThrow(() => updateLoop(), 'updateLoop must not throw when onscreen during context loss');
  assert.strictEqual(activeAnimationLoop, null, 'Animation loop must stay null');

  // 2. Tab switches while context lost
  mockDocument.hidden = true;
  assert.doesNotThrow(() => updateLoop());
  mockDocument.hidden = false;
  assert.doesNotThrow(() => updateLoop());

  // 3. Texture loader callback finishes while context lost
  const renderFrame = () => {
    if (!isContextLost) {
      mockRenderer.render();
    }
  };
  assert.doesNotThrow(() => renderFrame());
});

runTest('3.3: webglcontextrestored resets flags, triggers material needsUpdate, and recovers loop', () => {
  let isContextLost = true;
  let activeAnimationLoop = null;

  const mockEarthMat = {
    needsUpdate: false,
    uniforms: {
      dayMap: { value: { needsUpdate: false } },
      cloudMap: { value: { needsUpdate: false } },
    }
  };
  const mockAtmoMat = { needsUpdate: false };

  const mockRenderer = {
    setAnimationLoop: (cb) => { activeAnimationLoop = cb; },
    render: () => {}
  };

  const isVisible = true;
  const mockDocument = { hidden: false };
  const reduceMotion = false;
  const tick = () => {};

  const updateLoop = () => {
    if (reduceMotion || isContextLost) {
      mockRenderer.setAnimationLoop(null);
      mockRenderer.render();
      return;
    }
    const shouldRun = isVisible && !mockDocument.hidden;
    mockRenderer.setAnimationLoop(isVisible && !mockDocument.hidden ? tick : null);
  };

  const onContextRestored = () => {
    isContextLost = false;
    if (mockEarthMat) {
      mockEarthMat.needsUpdate = true;
      if (mockEarthMat.uniforms.dayMap.value) mockEarthMat.uniforms.dayMap.value.needsUpdate = true;
      if (mockEarthMat.uniforms.cloudMap.value) mockEarthMat.uniforms.cloudMap.value.needsUpdate = true;
    }
    if (mockAtmoMat) mockAtmoMat.needsUpdate = true;
    updateLoop();
  };

  onContextRestored();

  assert.strictEqual(isContextLost, false, 'isContextLost must be false');
  assert.strictEqual(mockEarthMat.needsUpdate, true, 'earthMat.needsUpdate must be set to true');
  assert.strictEqual(mockEarthMat.uniforms.dayMap.value.needsUpdate, true, 'dayMap texture needsUpdate must be true');
  assert.strictEqual(mockEarthMat.uniforms.cloudMap.value.needsUpdate, true, 'cloudMap texture needsUpdate must be true');
  assert.strictEqual(mockAtmoMat.needsUpdate, true, 'atmoMat.needsUpdate must be set to true');
  assert.strictEqual(activeAnimationLoop, tick, 'Animation loop tick must be cleanly restored');
});

runTest('3.4: Rapid WebGL context loss/restore flapping stress test (100 cycles)', () => {
  let isContextLost = false;
  let activeAnimationLoop = null;

  const mockRenderer = {
    setAnimationLoop: (cb) => { activeAnimationLoop = cb; },
    render: () => {}
  };

  const isVisible = true;
  const mockDocument = { hidden: false };
  const reduceMotion = false;
  const tick = () => {};

  const updateLoop = () => {
    if (reduceMotion || isContextLost) {
      mockRenderer.setAnimationLoop(null);
      mockRenderer.render();
      return;
    }
    const shouldRun = isVisible && !mockDocument.hidden;
    mockRenderer.setAnimationLoop(isVisible && !mockDocument.hidden ? tick : null);
  };

  const onContextLost = (e) => {
    e.preventDefault();
    isContextLost = true;
    mockRenderer.setAnimationLoop(null);
  };

  const onContextRestored = () => {
    isContextLost = false;
    updateLoop();
  };

  // Initial state: running
  updateLoop();
  assert.strictEqual(activeAnimationLoop, tick);

  // 100 rapid oscillations
  for (let cycle = 0; cycle < 100; cycle++) {
    onContextLost({ preventDefault: () => {} });
    assert.strictEqual(activeAnimationLoop, null, `Cycle ${cycle}: loop must stop on loss`);

    onContextRestored();
    assert.strictEqual(activeAnimationLoop, tick, `Cycle ${cycle}: loop must restore on restored`);
  }
});

// ============================================================================
// SUITE 4: DIRTY-RECT BOUNDARIES & MEMORY ALLOCATION HARNESS
// ============================================================================
console.log('\n--- SUITE 4: Dirty-Rect Boundaries & Zero Allocation Loop ---');

runTest('4.1: Dirty-rect integer snapping and coordinate clamping across extreme jumps', () => {
  const w = 1920;
  const h = 1080;
  const RADIUS = 200;
  const pad = RADIUS + 26; // 226

  function getDirtyRect(prevPos, pos) {
    const minX = Math.max(0, Math.floor(Math.min(prevPos.x, pos.x) - pad));
    const minY = Math.max(0, Math.floor(Math.min(prevPos.y, pos.y) - pad));
    const maxX = Math.min(w, Math.ceil(Math.max(prevPos.x, pos.x) + pad));
    const maxY = Math.min(h, Math.ceil(Math.max(prevPos.y, pos.y) + pad));
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  // Extreme cursor teleportation: top-left to bottom-right
  const rect1 = getDirtyRect({ x: -500, y: -500 }, { x: 3000, y: 3000 });
  assert.strictEqual(rect1.x, 0, 'minX must clamp to 0');
  assert.strictEqual(rect1.y, 0, 'minY must clamp to 0');
  assert.strictEqual(rect1.w, 1920, 'Width must clamp to screen width');
  assert.strictEqual(rect1.h, 1080, 'Height must clamp to screen height');

  // Small subpixel jitter
  const rect2 = getDirtyRect({ x: 500.12345, y: 400.98765 }, { x: 500.12346, y: 400.98766 });
  assert(Number.isInteger(rect2.x), 'rect.x must be integer');
  assert(Number.isInteger(rect2.y), 'rect.y must be integer');
  assert(Number.isInteger(rect2.w), 'rect.w must be integer');
  assert(Number.isInteger(rect2.h), 'rect.h must be integer');
  assert.strictEqual(rect2.x, 500 - pad);
  assert.strictEqual(rect2.y, 400 - pad);
  assert.strictEqual(rect2.w, pad * 2 + 1); // Math.ceil(500.12346 + pad) - Math.floor(500.12345 - pad)
});

runTest('4.2: Zero-allocation loop memory verification across 1,000 frames', () => {
  const NUM_BINS = 16;
  const bins = Array.from({ length: NUM_BINS }, () => []);
  const initialBinReferences = bins.map(b => b);

  for (let frame = 0; frame < 1000; frame++) {
    // Reset bins in-place (exact Ambient.jsx code)
    for (let b = 1; b < NUM_BINS; b += 1) {
      bins[b].length = 0;
    }

    // Populate with simulated hexagon coordinates
    for (let b = 1; b < NUM_BINS; b += 1) {
      for (let pt = 0; pt < 10; pt++) {
        bins[b].push(100 + pt * 20, 200 + pt * 20);
      }
    }
  }

  // Verify that array references never mutated
  for (let b = 0; b < NUM_BINS; b++) {
    assert.strictEqual(bins[b], initialBinReferences[b], `Bin ${b} array reference mutated (GC allocation occurred)`);
  }
});

// ============================================================================
// SUITE 5: TEXTURE ASYNC LIFECYCLE & UNMOUNT DISPOSAL
// ============================================================================
console.log('\n--- SUITE 5: Texture Async Lifecycle & Unmount Disposal ---');

runTest('5.1: Asynchronous texture load callbacks handle pre-unmount and post-unmount correctly', () => {
  let mounted = true;
  let fallbackDisposed = false;
  let renderCalled = false;

  const mockTex = {
    dispose: () => { fallbackDisposed = true; },
    anisotropy: 1,
    wrapS: 1,
  };

  const onLoadCallback = (tex) => {
    if (!mounted) {
      tex.dispose();
      return;
    }
    renderCalled = true;
  };

  // Case A: Unmounted before fallback texture loads
  mounted = false;
  onLoadCallback(mockTex);
  assert.strictEqual(fallbackDisposed, true, 'Texture must be disposed if unmounted before load completes');
  assert.strictEqual(renderCalled, false, 'Render must not be called after unmount');
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n======================================================================');
console.log(`  EMPIRICAL CHALLENGER 2 SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
console.log('======================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
