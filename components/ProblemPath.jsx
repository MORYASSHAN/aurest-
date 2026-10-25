'use client';

import { useEffect, useRef } from 'react';
import Reveal from './Reveal';
import ScrollText from './ScrollText';

/**
 * A vertical path that fills as you scroll. Each problem lights up when the
 * line reaches it, and the path ends at the gap Aurest fills.
 */
export default function ProblemPath({ intro, nodes, gap, close }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const points = [...track.querySelectorAll('[data-node]')];

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      track.style.setProperty('--p', '1');
      points.forEach((el) => el.classList.add('active'));
      return;
    }

    let frame = 0;
    let pointCenters = [];
    const measurePoints = () => {
      pointCenters = points.map((el) => el.offsetTop + el.offsetHeight / 2);
    };
    measurePoints();

    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -100 || rect.top > vh + 100) return;

      const progress = Math.min(1, Math.max(0, (vh * 0.62 - rect.top) / rect.height));
      track.style.setProperty('--p', progress.toFixed(4));

      const reached = progress * rect.height;
      for (let i = 0; i < points.length; i += 1) {
        points[i].classList.toggle('active', reached >= pointCenters[i] - 4);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measurePoints();
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="path">
      <Reveal as="p" className="path-intro">
        {intro}
      </Reveal>

      <div ref={trackRef} className="path-track">
        <div className="path-line" aria-hidden="true">
          <span className="path-fill" />
        </div>

        {nodes.map((node, i) => (
          <div key={node.label} data-node className={`path-node ${i % 2 ? 'is-right' : 'is-left'}`}>
            <span className="path-dot" aria-hidden="true" />
            <div className="path-card">
              <span className="label">{node.label}</span>
              <p>{node.text}</p>
            </div>
          </div>
        ))}

        <div data-node className="path-node is-end">
          <span className="path-dot" aria-hidden="true" />
        </div>
      </div>

      <div className="path-gap">
        <ScrollText segments={gap} className="quote" />
        <Reveal as="p" className="path-close">
          {close}
        </Reveal>
      </div>
    </div>
  );
}
