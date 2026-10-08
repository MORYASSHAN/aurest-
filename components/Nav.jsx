'use client';

import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#technology', label: 'Technology' },
  { href: '#vision', label: 'Vision', optional: true },
  { href: '#contact', label: 'Contact' },
];

/** Minimal top bar that slides in after the hero, with a page-progress line. */
export default function Nav() {
  const [shown, setShown] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShown(window.scrollY > window.innerHeight * 0.75);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }
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
    <nav className={shown ? 'nav shown' : 'nav'} aria-label="Main">
      <a href="#top" className="nav-brand">
        AUREST
      </a>
      <div className="nav-links">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className={link.optional ? 'nav-optional' : undefined}>
            {link.label}
          </a>
        ))}
      </div>
      <span className="nav-progress" aria-hidden="true">
        <span ref={progressRef} />
      </span>
    </nav>
  );
}
