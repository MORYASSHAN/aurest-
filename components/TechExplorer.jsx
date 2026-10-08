'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import TechVisual from './TechVisuals';

// Pinned (scroll-driven) mode only when there is room for the panel to stay fixed.
const PIN_QUERY = '(min-width: 960px) and (min-height: 720px)';
const STEP = 0.75; // viewport heights of scrolling per technology

const pad = (n) => String(n).padStart(2, '0');

/**
 * Technology explorer. On large screens the panel stays fixed while scrolling
 * walks through each technology along a connected path; on small screens the
 * tabs simply switch.
 */
export default function TechExplorer({ items }) {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const sync = () => setPinned(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!pinned || !el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const stepPx = window.innerHeight * STEP;
      const scrolled = -el.getBoundingClientRect().top;
      const raw = Math.max(0, scrolled / stepPx);
      const index = Math.min(items.length - 1, Math.floor(raw));
      setActive(index);
      // overall progress along the path, 0 → 1
      el.style.setProperty('--op', Math.min(1, raw / (items.length - 1)).toFixed(4));
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
  }, [pinned, items.length]);

  const select = useCallback(
    (index) => {
      const el = scrollerRef.current;
      if (pinned && el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + index * window.innerHeight * STEP + 2, behavior: 'smooth' });
      } else {
        setActive(index);
      }
    },
    [pinned]
  );

  const tech = items[active];

  return (
    <div
      ref={scrollerRef}
      className={pinned ? 'explorer is-pinned' : 'explorer'}
      style={{
        '--op': pinned ? undefined : active / (items.length - 1),
        height: pinned ? `calc(100vh + ${(items.length - 1) * STEP * 100}vh)` : undefined,
      }}
    >
      <div className="explorer-sticky">
        <div className="explorer-grid">
          {/* Tabs along a path */}
          <div className="explorer-nav">
            <div className="explorer-tabs" role="tablist" aria-label="Technologies">
              <span className="tabs-rail" aria-hidden="true">
                <span className="tabs-rail-fill" />
              </span>
              {items.map((item, i) => (
                <button
                  key={item.id}
                  id={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  aria-controls="tech-panel"
                  className={[
                    'explorer-tab',
                    active === i && 'active',
                    i < active && 'done',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => select(i)}
                >
                  <span className="tab-node" aria-hidden="true" />
                  <span className="tab-text">
                    <span className="tab-num">{pad(i + 1)}</span>
                    <span className="tab-name">{item.name}</span>
                    <span className="tab-tagline">{item.tagline}</span>
                  </span>
                </button>
              ))}
            </div>

            {pinned && (
              <p className="explorer-hint" aria-hidden="true">
                <span className="hint-mouse" />
                Scroll to explore
              </p>
            )}
          </div>

          {/* Panel */}
          <div id="tech-panel" role="tabpanel" aria-live="polite" className="explorer-panel">
            <div key={tech.id} className="panel-inner">
              <div className="panel-visual">
                <span className="panel-index" aria-hidden="true">
                  {pad(active + 1)}
                  <small>/ {pad(items.length)}</small>
                </span>
                <TechVisual type={tech.visual} />
                <span className="panel-visual-name" aria-hidden="true">
                  {tech.name}
                </span>
              </div>

              <div className="panel-body">
                <div className="panel-head">
                  <span className={`status status-${tech.status.kind}`}>
                    <span className="status-dot" />
                    {tech.status.label}
                  </span>
                  <h3>{tech.name}</h3>
                  <p className="panel-tagline">{tech.tagline}</p>
                </div>

                <dl className="panel-facts">
                  <div className="fact">
                    <dt>The problem</dt>
                    <dd>{tech.problem}</dd>
                  </div>
                  <div className="fact fact-answer">
                    <dt>Our approach</dt>
                    <dd>{tech.solution}</dd>
                  </div>
                </dl>

                <ul className="panel-points">
                  {tech.points.map((point, i) => (
                    <li key={point} style={{ '--k': i }}>
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M3.5 8.5l3 3 6-7" />
                      </svg>
                      {point}
                    </li>
                  ))}
                </ul>

                <div className="panel-foot">
                  <ul className="pills" aria-label="Used in">
                    {tech.usedIn.map((u) => (
                      <li key={u} className="pill">
                        {u}
                      </li>
                    ))}
                  </ul>
                  {tech.status.detail && <p className="panel-note">{tech.status.detail}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
