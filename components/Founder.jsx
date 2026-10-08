'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import { founder } from '@/lib/content';

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

export default function Founder() {
  // Falls back to initials until public/images/founder.jpg exists
  const [photoOk, setPhotoOk] = useState(true);

  return (
    <section id="founder" className="section section-white">
      <div className="container founder">
        <Reveal className="founder-photo">
          {photoOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={founder.photo} alt={`Portrait of ${founder.name}`} onError={() => setPhotoOk(false)} />
          ) : (
            <span className="founder-initials" aria-label={founder.name}>
              {founder.initials}
            </span>
          )}
          <div className="founder-stats">
            {founder.highlights.map((h) => (
              <div key={h.label}>
                <strong>{h.value}</strong>
                <span>{h.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="founder-text">
          <Reveal as="p" className="eyebrow">
            <span className="eyebrow-dot" />
            {founder.eyebrow}
          </Reveal>
          <Reveal as="h2" className="section-title" delay={0.08}>
            {founder.name}
          </Reveal>
          <Reveal as="p" className="founder-role" delay={0.14}>
            {founder.role}
          </Reveal>

          <div className="founder-bio">
            {founder.paragraphs.map((p, i) => (
              <Reveal as="p" key={i} delay={0.18 + i * 0.06} className={i === 0 ? 'first' : undefined}>
                {p}
              </Reveal>
            ))}
          </div>

          <Reveal as="figure" className="founder-quote" delay={0.2}>
            <blockquote>“{founder.quote}”</blockquote>
            <figcaption>— {founder.name}</figcaption>
          </Reveal>

          <Reveal delay={0.25}>
            <a className="btn btn-ghost" href={founder.linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedInIcon />
              Connect on LinkedIn
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
