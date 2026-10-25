import SectionHeader from './SectionHeader';
import FeatureCard from './FeatureCard';

const FEATURES = [
  {
    number: '01',
    title: 'STOP',
    text: 'Next-generation hemostatic technologies.',
    image: {
      src: '/images/stop.webp',
      alt: 'Red blood cells trapped in a tight biopolymer fibrin clot mesh',
    },
  },
  {
    number: '02',
    title: 'NEUTRALIZE',
    text: 'Disarming lethal venom toxins directly at the bite site.',
    image: {
      src: '/images/neutralize.webp',
      alt: 'Disarming lethal venom toxins directly at the bite site',
    },
  },
  {
    number: '03',
    title: 'PRESERVE',
    text: 'Vitrification platforms that protect biologics without cold chain.',
    image: {
      src: '/images/preserve.webp',
      alt: 'Vitrification platforms that protect biologics without cold chain',
    },
  },
];

export default function Story() {
  return (
    <section className="section story">
      <div className="container">
        <SectionHeader
          title={['Medicine needs', 'more time.']}
          lead="When seconds decide survival, biology has to move faster. Aurest builds biotechnology for those critical moments."
        />

        <div className="cards">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} delay={i * 0.12} />
          ))}
        </div>
      </div>
    </section>
  );
}
