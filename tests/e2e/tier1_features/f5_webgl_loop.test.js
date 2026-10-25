import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F5: WebGL Controlled Loop & Motion Control', () => {
  const rootDir = path.resolve(process.cwd());
  const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
  const earthContent = fs.readFileSync(earthPath, 'utf8');

  it('TC-F5-01: Earth.jsx listens for visibilitychange and halts loop when document.hidden is true', () => {
    // Assert document.hidden is checked in loop condition
    expect(earthContent).toContain('document.hidden');
    // Assert visibilitychange listener is registered
    expect(earthContent).toContain("document.addEventListener('visibilitychange'");
    // Assert visibilitychange listener is cleaned up
    expect(earthContent).toContain("document.removeEventListener('visibilitychange'");
  });

  it('TC-F5-02: Earth.jsx utilizes IntersectionObserver to pause WebGL rendering when offscreen', () => {
    // Assert IntersectionObserver is instantiated
    expect(earthContent).toContain('new IntersectionObserver');
    // Assert entry.isIntersecting is checked
    expect(earthContent).toContain('entry.isIntersecting');
    // Assert observer observes mount
    expect(earthContent).toContain('visibility.observe(mount)');
    // Assert observer disconnect on unmount
    expect(earthContent).toContain('visibility.disconnect()');
  });

  it('TC-F5-03: Earth.jsx checks prefers-reduced-motion: reduce and bypasses continuous animation loop', () => {
    // Assert matchMedia query for reduced motion
    expect(earthContent).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    // Assert renderer.render is called for static rendering when motion is reduced
    expect(earthContent).toContain('reduceMotion');
    expect(earthContent).toContain('renderer.render(scene, camera)');
  });

  it('TC-F5-04: Earth.jsx disposes of geometries, materials, textures, and renderer on component unmount', () => {
    // Assert disposal of resources
    expect(earthContent).toContain('earthGeo.dispose()');
    expect(earthContent).toContain('atmoGeo.dispose()');
    expect(earthContent).toContain('earthMat.dispose()');
    expect(earthContent).toContain('atmoMat.dispose()');
    expect(earthContent).toContain('dayMap.dispose()');
    expect(earthContent).toContain('cloudMap.dispose()');
    expect(earthContent).toContain('renderer.dispose()');
  });

  it('TC-F5-05: Earth.jsx handles webglcontextlost and webglcontextrestored lifecycle events', () => {
    expect(earthContent).toContain('webglcontextlost');
    expect(earthContent).toContain('webglcontextrestored');
    expect(earthContent).toContain('e.preventDefault()');
  });
});
