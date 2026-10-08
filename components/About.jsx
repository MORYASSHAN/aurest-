import SectionHeader from './SectionHeader';
import ProblemPath from './ProblemPath';
import Pillars from './Pillars';
import { about } from '@/lib/content';

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHeader eyebrow={about.eyebrow} title={about.title} lead={about.lead} />
        <ProblemPath {...about.path} />
        <Pillars groups={about.pillars} />
      </div>
    </section>
  );
}
