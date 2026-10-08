import Reveal from './Reveal';

/**
 * Centered section header: optional eyebrow, title and lead.
 * Pass `title` as an array to break it into lines; lines after the first are accented.
 */
export default function SectionHeader({ eyebrow, title, lead }) {
  const lines = Array.isArray(title) ? title : [title];

  return (
    <header className="section-header">
      {eyebrow && (
        <Reveal as="p" className="eyebrow">
          <span className="eyebrow-dot" />
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2" className="section-title" delay={0.08}>
        {lines.map((line, i) => (
          <span key={line} className={i > 0 ? 'line hl' : 'line'}>
            {line}
          </span>
        ))}
      </Reveal>
      {lead && (
        <Reveal as="p" className="section-lead" delay={0.16}>
          {lead}
        </Reveal>
      )}
    </header>
  );
}
