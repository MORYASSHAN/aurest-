'use client';

import { Fragment, useEffect, useMemo, useRef } from 'react';

/**
 * Text whose words light up one by one as it scrolls through the viewport.
 * `segments` is a list of `{ text, hl }`; highlighted segments render in the accent colour.
 */
export default function ScrollText({ as: Tag = 'p', segments, className = '' }) {
  const ref = useRef(null);

  const words = useMemo(
    () =>
      segments.flatMap((seg) =>
        seg.text
          .split(' ')
          .filter(Boolean)
          .map((word) => ({ word, hl: Boolean(seg.hl) }))
      ),
    [segments]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--p', '1');
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the text enters the bottom of the screen, 1 by the time it is centered
      const start = vh * 0.9;
      const distance = vh * 0.45 + rect.height * 0.4;
      const atPageEnd =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      const progress = atPageEnd ? 1 : Math.min(1, Math.max(0, (start - rect.top) / distance));
      el.style.setProperty('--p', progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Tag ref={ref} className={`scroll-text ${className}`} style={{ '--n': words.length }}>
      {words.map(({ word, hl }, i) => (
        <Fragment key={i}>
          <span className={hl ? 'w hl' : 'w'} style={{ '--i': i }}>
            {word}
          </span>{' '}
        </Fragment>
      ))}
    </Tag>
  );
}
