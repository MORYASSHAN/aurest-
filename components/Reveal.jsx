'use client';

import { useEffect, useRef, useState } from 'react';

const VARIANT_CLASS = {
  fade: 'reveal',
  line: 'line-reveal',
  'line-y': 'line-reveal-y',
};

/**
 * Animates its content the first time it scrolls into view.
 * - `fade`   (default) fades and slides up
 * - `line`   scales a horizontal line out from the center
 * - `line-y` grows a vertical line downward
 */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  variant = 'fade',
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = [VARIANT_CLASS[variant] ?? 'reveal', visible && 'in', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} style={{ '--d': `${delay}s`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
