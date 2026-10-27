'use client';

import { useEffect, useRef, useState } from 'react';

const LINKS = [
  { href: '#top', id: 'top', label: 'Home' },
  { href: '#about', id: 'about', label: 'About' },
  { href: '#technology', id: 'technology', label: 'Technology' },
  { href: '#vision', id: 'vision', label: 'Vision' },
  { href: '#founder', id: 'founder', label: 'Founder' },
  { href: '#contact', id: 'contact', label: 'Contact' },
];

/**
 * Top navigation. Light white glass over the hero, more solid after scrolling.
 * Marks the section currently on screen; collapses into a menu button on phones.
 */
export default function Nav() {
  const [onHero, setOnHero] = useState(true);
  const [current, setCurrent] = useState('top');
  const [open, setOpen] = useState(false);
  const progressRef = useRef(null);

  // Scroll state + page progress line
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setOnHero(window.scrollY < window.innerHeight * 0.6);
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

  // Which section is on screen
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close the phone menu with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const classes = ['nav', onHero && 'on-hero', open && 'open'].filter(Boolean).join(' ');

  return (
    <nav className={classes} aria-label="Main">
      <a href="#top" className="nav-brand" onClick={() => setOpen(false)}>
        AUREST
      </a>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="nav-links"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>

      <div id="nav-links" className="nav-links">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={current === link.id ? 'current' : undefined}
            aria-current={current === link.id ? 'true' : undefined}
            onClick={() => setOpen(false)}
          >
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
