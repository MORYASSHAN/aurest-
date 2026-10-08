import SectionHeader from './SectionHeader';
import FeatureCard from './FeatureCard';

// Photos: Unsplash (free license)
// Request a capped size from Unsplash so Next's optimizer doesn't fetch the full-res original
const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const FEATURES = [
  {
    number: '01',
    title: 'STOP',
    text: 'Next-generation hemostatic technologies.',
    image: { src: unsplash('1680279019882-d0317164a394'), alt: 'Red blood cells in a vein' },
  },
  {
    number: '02',
    title: 'REPAIR',
    text: 'Intervening before cellular damage becomes irreversible.',
    image: { src: unsplash('1631556097152-c39479bbff93'), alt: 'Fluorescent blue cells under a microscope' },
  },
  {
    number: '03',
    title: 'DELIVER',
    text: 'Precision platforms that protect and deliver biological therapies.',
    image: { src: unsplash('1579165466949-3180a3d056d5'), alt: 'Scientist using a pipette in a laboratory' },
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
