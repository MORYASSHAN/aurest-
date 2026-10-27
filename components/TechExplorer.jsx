'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import TechVisual from './TechVisuals';

// Pinned (scroll-driven) mode only when there is room for the stage to stay fixed.
const PIN_QUERY = '(min-width: 960px) and (min-height: 700px)';
const STEP = 0.8; // viewport heights of scrolling per technology

const pad = (n) => String(n).padStart(2, '0');

/**
 * Technology explorer: one dark "lab stage" with a tab per technology.
 * On large screens the stage stays fixed while scrolling fills each tab's
 * progress bar and moves to the next technology; elsewhere the tabs just switch.
 */
export default function TechExplorer({ items }) {
  const scrollerRef = useRef(null);
  const stageRef = useRef(null);
  const tabsRef = useRef(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  // Pin only on large screens AND when the whole stage fits below the nav
  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    let timer = 0;
    const sync = () => {
      const stageHeight = stageRef.current?.offsetHeight ?? Infinity;
      setPinned(mq.matches && stageHeight + 110 <= window.innerHeight);
    };
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(sync, 150);
    };
    sync();
    mq.addEventListener('change', sync);
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      mq.removeEventListener('change', sync);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Scroll position → active technology + each tab's progress bar
  useEffect(() => {
    const el = scrollerRef.current;
    if (!pinned || !el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const raw = Math.max(0, -el.getBoundingClientRect().top / (window.innerHeight * STEP));
      setActive(Math.min(items.length - 1, Math.floor(raw)));
      const tabs = tabsRef.current?.children ?? [];
      for (let i = 0; i < tabs.length; i += 1) {
        tabs[i].style.setProperty('--fill', Math.min(1, Math.max(0, raw - i)).toFixed(3));
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
  }, [pinned, items.length]);

  const select = useCallback(
    (index) => {
      const el = scrollerRef.current;
      if (pinned && el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        // land a little into the step so its bar is visibly started
        window.scrollTo({ top: top + (index + 0.12) * window.innerHeight * STEP, behavior: 'smooth' });
      } else {
        setActive(index);
      }
    },
    [pinned]
  );

  // Arrow keys move between tabs (standard tablist behaviour)
  const onTabKey = (e) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const next = (active + delta + items.length) % items.length;
    select(next);
    tabsRef.current?.children[next]?.focus();
  };

  const tech = items[active];

  return (
    <div
      ref={scrollerRef}
      className={pinned ? 'explorer is-pinned' : 'explorer'}
      style={{ height: pinned ? `calc(100vh + ${items.length * STEP * 100}vh)` : undefined }}
    >
      <div className="explorer-sticky">
        <div className="container">
          <div ref={stageRef} className="stage">
            <div ref={tabsRef} className="stage-tabs" role="tablist" aria-label="Technologies">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  id={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  aria-controls="tech-panel"
                  tabIndex={active === i ? 0 : -1}
                  className={active === i ? 'stage-tab active' : 'stage-tab'}
                  style={pinned ? undefined : { '--fill': i <= active ? 1 : 0 }}
                  onClick={() => select(i)}
                  onKeyDown={onTabKey}
                >
                  <span className="stage-tab-num">{pad(i + 1)}</span>
                  <span className="stage-tab-name">{item.name}</span>
                  <span className="stage-tab-bar" aria-hidden="true">
                    <span />
                  </span>
                </button>
              ))}
            </div>

            <div key={tech.id} id="tech-panel" role="tabpanel" aria-labelledby={tech.id} className="stage-panel">
              <div className="stage-body">
                <div className="stage-copy">
                  <span className={`status status-${tech.status.kind}`}>
                    <span className="status-dot" />
                    {tech.status.label}
                  </span>
                  <h3 className="stage-name">{tech.name}</h3>
                  <p className="stage-tagline">{tech.tagline}</p>

                  <dl className="stage-flow">
                    <div className="flow-step">
                      <dt>The problem</dt>
                      <dd>{tech.problem}</dd>
                    </div>
                    <div className="flow-step flow-answer">
                      <dt>Our approach</dt>
                      <dd>{tech.solution}</dd>
                    </div>
                  </dl>

                  <ul className="stage-points">
                    {tech.points.map((point) => (
                      <li key={point}>
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M3.5 8.5l3 3 6-7" />
                        </svg>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="stage-visual" aria-hidden="true">
                  <span className="stage-count">
                    {pad(active + 1)}
                    <small> / {pad(items.length)}</small>
                  </span>
                  <span className="stage-rings" />
                  <TechVisual type={tech.visual} />
                </div>
              </div>

              <div className="stage-foot">
                <span className="stage-foot-label">Used in</span>
                <ul className="pills" aria-label="Used in">
                  {tech.usedIn.map((u) => (
                    <li key={u} className="pill">
                      {u}
                    </li>
                  ))}
                </ul>
                {tech.status.detail && <p className="stage-note">{tech.status.detail}</p>}
              </div>
            </div>
          </div>

          {pinned && (
            <p className="explorer-hint" aria-hidden="true">
              <span className="hint-mouse" />
              Scroll to explore
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
