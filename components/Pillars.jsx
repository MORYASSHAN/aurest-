'use client';

import { useState } from 'react';
import Reveal from './Reveal';

/** Segmented toggle between "Focus areas" and "What we stand for". */
export default function Pillars({ groups }) {
  const [active, setActive] = useState(0);
  const group = groups[active];

  return (
    <Reveal className="pillars">
      <div className="segmented" role="tablist" aria-label="About Aurest">
        <span
          className="segmented-thumb"
          style={{ transform: `translateX(${active * 100}%)` }}
          aria-hidden="true"
        />
        {groups.map((g, i) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            id={`pillar-tab-${g.key}`}
            aria-selected={active === i}
            aria-controls={`pillar-panel-${g.key}`}
            className={active === i ? 'active' : undefined}
            onClick={() => setActive(i)}
          >
            {g.tab}
          </button>
        ))}
      </div>

      <div
        key={group.key}
        id={`pillar-panel-${group.key}`}
        role="tabpanel"
        aria-labelledby={`pillar-tab-${group.key}`}
        className="pillar-grid"
      >
        {group.items.map((item, i) => (
          <article key={item.title} className="pillar" style={{ '--i': i }}>
            <span className="pillar-num">{String(i + 1).padStart(2, '0')}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </Reveal>
  );
}
