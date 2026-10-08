import SectionHeader from './SectionHeader';
import TechExplorer from './TechExplorer';
import { technology } from '@/lib/content';

export default function Technology() {
  return (
    <section id="technology" className="section section-white section-tech">
      <div className="container">
        <SectionHeader eyebrow={technology.eyebrow} title={technology.title} lead={technology.lead} />
      </div>
      <TechExplorer items={technology.items} />
    </section>
  );
}
