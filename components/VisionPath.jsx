import Reveal from './Reveal';

/** Phase One → three long-term goals, connected by a line that draws in. */
export default function VisionPath({ items }) {
  return (
    <div className="vpath">
      <Reveal className="vpath-rail" aria-hidden="true">
        <span className="vpath-start">Phase One · today</span>
        <span className="vpath-line">
          <span className="vpath-fill" />
        </span>
      </Reveal>

      <div className="vpath-grid">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={0.15 + i * 0.15} className="vcard-wrap">
            <article className="vcard">
              <span className="vcard-num">Next · {String(i + 1).padStart(2, '0')}</span>
              <h3>{item.name}</h3>
              <p className="vcard-problem">{item.problem}</p>
              <p className="vcard-idea">{item.idea}</p>

              {item.steps && (
                <ol className="vsteps" aria-label="Roadmap">
                  {item.steps.map((step, k) => (
                    <li key={step} style={{ '--k': k }}>
                      {step}
                    </li>
                  ))}
                </ol>
              )}

              {item.compare && (
                <dl className="vcompare">
                  {item.compare.map((row, k) => (
                    <div key={row.label} style={{ '--k': k }}>
                      <dt>{row.label}</dt>
                      <dd>
                        <s>{row.from}</s>
                        <svg viewBox="0 0 16 10" aria-hidden="true">
                          <path d="M1 5h13M10 1l4 4-4 4" />
                        </svg>
                        <strong>{row.to}</strong>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="vcard-goal">
                <span>Goal</span>
                <p>{item.goal}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
