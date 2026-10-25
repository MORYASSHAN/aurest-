import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F10: Zero Cumulative Layout Shift (CLS)', () => {
  const rootDir = path.resolve(process.cwd());
  const heroPath = path.join(rootDir, 'components', 'Hero.jsx');
  const founderPath = path.join(rootDir, 'components', 'Founder.jsx');
  const featureCardPath = path.join(rootDir, 'components', 'FeatureCard.jsx');
  const cssPath = path.join(rootDir, 'app', 'globals.css');
  const layoutPath = path.join(rootDir, 'app', 'layout.js');

  const heroContent = fs.readFileSync(heroPath, 'utf8');
  const founderContent = fs.readFileSync(founderPath, 'utf8');
  const featureCardContent = fs.readFileSync(featureCardPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  it('TC-F10-01: Hero.jsx initializes horizon state to 60% eliminating post-hydration headline shift', () => {
    // Must be useState(60), not useState(50)
    expect(heroContent).toMatch(/useState\(\s*60\s*\)/);
    expect(heroContent).not.toMatch(/useState\(\s*50\s*\)/);
  });

  it('TC-F10-02: FeatureCard media containers enforce explicit aspect-ratio and layout placeholder in CSS', () => {
    // FeatureCard component uses fill image with explicit sizes
    expect(featureCardContent).toContain('<Image');
    expect(featureCardContent).toContain('fill');

    // CSS defines aspect-ratio 16 / 10 and background color for card-media
    expect(cssContent).toContain('.card-media');
    expect(cssContent).toMatch(/aspect-ratio:\s*16\s*\/\s*10/);
  });

  it('TC-F10-03: Founder image enforces explicit width and height dimensions', () => {
    expect(founderContent).toContain('width={400}');
    expect(founderContent).toContain('height={400}');
  });

  it('TC-F10-04: Partner logo containers enforce fixed width and height dimensions', () => {
    expect(cssContent).toContain('.partner-logo');
    expect(cssContent).toMatch(/width:\s*64px/);
    expect(cssContent).toMatch(/height:\s*64px/);
  });

  it('TC-F10-05: Typography specifies display: swap preventing FOIT/FOUT font shift', () => {
    expect(layoutContent).toContain("display: 'swap'");
  });
});
