'use client';

import { forwardRef, useEffect, useRef } from 'react';
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  TextureLoader,
  ShaderMaterial,
  SphereGeometry,
  Mesh,
  Vector3,
  BackSide,
  Clock,
  MathUtils,
} from 'three';
import {
  earthVertex,
  earthFragment,
  atmosphereVertex,
  atmosphereFragment,
} from '@/lib/earthShaders';

const TEXTURE_BASE = '/textures/';

// Atlantic / Europe / Africa facing the viewer, north tilted toward the horizon
const BASE_LON = -Math.PI / 2 - MathUtils.degToRad(2);
const TILT = MathUtils.degToRad(-12);

/**
 * Half-Earth rendered with three.js.
 * Calls `onLayout(horizonPercent)` whenever the horizon position changes,
 * so the hero text can sit in the sky above it.
 */
const Earth = forwardRef(function Earth({ onLayout }, ref) {
  const mountRef = useRef(null);
  const onLayoutRef = useRef(onLayout);
  onLayoutRef.current = onLayout;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---- Renderer, scene, camera ----
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    // Lighter rendering on small screens keeps phones smooth and cool
    const maxDpr = window.innerWidth < 768 ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    mount.appendChild(canvas);

    // Guard against WebGL context crashes
    let isContextLost = false;
    const onContextLost = (e) => {
      e.preventDefault();
      isContextLost = true;
      renderer.setAnimationLoop(null);
    };
    const onContextRestored = () => {
      isContextLost = false;
      updateLoop();
    };
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    canvas.addEventListener('webglcontextrestored', onContextRestored, false);

    const scene = new Scene();
    // Orthographic camera keeps the horizon a clean, wide arc
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(0, 0, 10);

    // ---- Textures with automatic JPG/PNG fallback ----
    const loader = new TextureLoader();
    loader.setCrossOrigin('anonymous');

    const dayMap = loader.load(
      `${TEXTURE_BASE}earth_atmos_2048.webp`,
      undefined,
      undefined,
      () => {
        loader.load(`${TEXTURE_BASE}earth_atmos_2048.jpg`, (tex) => {
          if (earthMat) earthMat.uniforms.dayMap.value = tex;
        });
      }
    );

    const cloudMap = loader.load(
      `${TEXTURE_BASE}earth_clouds_1024.webp`,
      undefined,
      undefined,
      () => {
        loader.load(`${TEXTURE_BASE}earth_clouds_1024.png`, (tex) => {
          if (earthMat) earthMat.uniforms.cloudMap.value = tex;
        });
      }
    );

    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    dayMap.anisotropy = anisotropy;
    cloudMap.anisotropy = anisotropy;

    // ---- Earth ----
    const earthMat = new ShaderMaterial({
      uniforms: {
        dayMap: { value: dayMap },
        cloudMap: { value: cloudMap },
        sunDir: { value: new Vector3(-0.55, 0.55, 0.65).normalize() },
        time: { value: 0 },
      },
      vertexShader: earthVertex,
      fragmentShader: earthFragment,
    });
    const earthGeo = new SphereGeometry(1, 96, 96);
    const earth = new Mesh(earthGeo, earthMat);
    earth.rotation.order = 'XYZ';
    earth.rotation.x = TILT;
    scene.add(earth);

    // ---- Atmosphere halo ----
    const atmoMat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: BackSide,
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
    });
    const atmoGeo = new SphereGeometry(1.045, 96, 96);
    const atmosphere = new Mesh(atmoGeo, atmoMat);
    scene.add(atmosphere);

    // ---- Layout: Earth wider than the screen, horizon just below the middle ----
    const layout = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      const aspect = w / h;

      renderer.setSize(w, h, false);
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();

      const radius = Math.max(aspect * 1.55, 1.25);
      // horizon sits about two-thirds down, leaving the sky above for the headline
      const horizonY = aspect > 1 ? -0.2 : -0.24;
      earth.scale.setScalar(radius);
      atmosphere.scale.setScalar(radius);
      earth.position.y = atmosphere.position.y = horizonY - radius;

      onLayoutRef.current?.(((1 - horizonY) / 2) * 100);
    };
    layout();
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(mount);

    // ---- Animation loop ----
    const clock = new Clock();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = () => {
      if (isContextLost) return;
      const t = clock.getElapsedTime();
      earthMat.uniforms.time.value = t;
      earth.rotation.y = BASE_LON + t * 0.03; // slow, visible spin
      renderer.render(scene, camera);
    };

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      renderer.setAnimationLoop(tick);
    }

    // Pause rendering while the globe is off-screen or tab is hidden
    let isVisible = true;
    const updateLoop = () => {
      if (reduceMotion || isContextLost) return;
      renderer.setAnimationLoop(isVisible && !document.hidden ? tick : null);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      updateLoop();
    });
    visibility.observe(mount);

    const onVisibilityChange = () => {
      updateLoop();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // ---- Cleanup ----
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      visibility.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      renderer.setAnimationLoop(null);
      earthGeo.dispose();
      atmoGeo.dispose();
      earthMat.dispose();
      atmoMat.dispose();
      dayMap.dispose();
      cloudMap.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={(node) => {
        mountRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className="earth"
      aria-hidden="true"
    />
  );
});

export default Earth;
