'use client';

import { forwardRef, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  earthVertex,
  earthFragment,
  atmosphereVertex,
  atmosphereFragment,
} from '@/lib/earthShaders';

const TEXTURE_BASE = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/';

// Atlantic / Europe / Africa facing the viewer, north tilted toward the horizon
const BASE_LON = -Math.PI / 2 - THREE.MathUtils.degToRad(2);
const TILT = THREE.MathUtils.degToRad(-12);

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
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Orthographic camera keeps the horizon a clean, wide arc
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(0, 0, 10);

    // ---- Textures ----
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const dayMap = loader.load(`${TEXTURE_BASE}earth_atmos_2048.jpg`);
    const cloudMap = loader.load(`${TEXTURE_BASE}earth_clouds_1024.png`);
    const anisotropy = renderer.capabilities.getMaxAnisotropy();
    dayMap.anisotropy = anisotropy;
    cloudMap.anisotropy = anisotropy;

    // ---- Earth ----
    const earthMat = new THREE.ShaderMaterial({
      uniforms: {
        dayMap: { value: dayMap },
        cloudMap: { value: cloudMap },
        sunDir: { value: new THREE.Vector3(-0.55, 0.55, 0.65).normalize() },
        time: { value: 0 },
      },
      vertexShader: earthVertex,
      fragmentShader: earthFragment,
    });
    const earthGeo = new THREE.SphereGeometry(1, 128, 128);
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.order = 'XYZ';
    earth.rotation.x = TILT;
    scene.add(earth);

    // ---- Atmosphere halo ----
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
    });
    const atmoGeo = new THREE.SphereGeometry(1.045, 128, 128);
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
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

      const radius = Math.max(aspect * 1.35, 1.1);
      const horizonY = aspect > 1 ? -0.08 : -0.2;
      earth.scale.setScalar(radius);
      atmosphere.scale.setScalar(radius);
      earth.position.y = atmosphere.position.y = horizonY - radius;

      onLayoutRef.current?.(((1 - horizonY) / 2) * 100);
    };
    layout();
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(mount);

    // ---- Animation loop ----
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      earthMat.uniforms.time.value = t;
      earth.rotation.y = BASE_LON + Math.sin(t * 0.04) * 0.12; // gentle drift
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(tick);

    // Pause rendering while the globe is off-screen
    const visibility = new IntersectionObserver(([entry]) => {
      renderer.setAnimationLoop(entry.isIntersecting ? tick : null);
    });
    visibility.observe(mount);

    // ---- Cleanup ----
    return () => {
      visibility.disconnect();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      earthGeo.dispose();
      atmoGeo.dispose();
      earthMat.dispose();
      atmoMat.dispose();
      dayMap.dispose();
      cloudMap.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
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
