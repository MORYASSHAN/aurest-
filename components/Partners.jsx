import Reveal from './Reveal';
import SectionHeader from './SectionHeader';
import { partners } from '@/lib/content';

export default function Partners() {
  return (
    <section id="partners" className="section">
      <div className="container">
        <SectionHeader eyebrow={partners.eyebrow} title={partners.title} />

        <div className="partners">
          {partners.items.map((p, i) => (
            <Reveal key={p.short} delay={0.1 + i * 0.12}>
              <article className="partner">
                <div className="partner-logo">
                  {p.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo} alt={`${p.name} logo`} />
                  ) : (
                    <span aria-hidden="true">{p.short}</span>
                  )}
                </div>
                <div>
                  <h3>
                    {p.name} <span className="partner-short">({p.short})</span>
                  </h3>
                  <p className="partner-org">{p.org}</p>
                  <p className="partner-text">{p.text}</p>
                  {p.url && (
                    <a className="partner-link" href={p.url} target="_blank" rel="noopener noreferrer">
                      Visit website
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M6 3h7v7M13 3L4 12" />
                      </svg>
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
