'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Earth = dynamic(() => import('./Earth'), {
  ssr: false,
  loading: () => <div className="earth" aria-hidden="true" />,
});

export default function Hero() {
  // 60% horizon matches the computed desktop resting line ((1 - (-0.2))/2 * 100), eliminating CLS
  const [horizon, setHorizon] = useState(60);
  const contentRef = useRef(null);
  const earthRef = useRef(null);

  // Gentle parallax: headline drifts up and fades, Earth sinks slower
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const h = window.innerHeight;
      if (y > h) return;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${-y * 0.25}px, 0)`;
        contentRef.current.style.opacity = String(Math.max(0, 1 - (y / h) * 1.6));
      }
      if (earthRef.current) {
        earthRef.current.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="top" className="hero">
      <div ref={earthRef} className="earth-parallax">
        <Earth onLayout={setHorizon} />
      </div>

      <div ref={contentRef} className="hero-content" style={{ height: `${horizon}%` }}>
        <h1 className="brand">AUREST</h1>
        <p className="tagline">Engineering the future of medicine.</p>
        <div className="rule" />
        <p className="lead">
          Advanced biotechnology for the moments when medicine has seconds to act.
        </p>
      </div>
    </section>
  );
}

