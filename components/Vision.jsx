import SectionHeader from './SectionHeader';
import VisionPath from './VisionPath';
import ScrollText from './ScrollText';
import { vision } from '@/lib/content';

export default function Vision() {
  return (
    <section id="vision" className="section">
      <div className="container">
        <SectionHeader eyebrow={vision.eyebrow} title={vision.title} lead={vision.lead} />
        <VisionPath items={vision.items} />
        <div className="closing">
          <ScrollText segments={vision.closing} className="quote quote-lg" />
        </div>
      </div>
    </section>
  );
}
