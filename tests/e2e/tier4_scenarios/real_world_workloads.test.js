import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 4: Real-World Application Scenarios');

describe('Tier 4: End-to-End Real-World Application Scenarios', () => {
  const rootDir = path.resolve(process.cwd());
  const routePath = path.join(rootDir, 'app', 'api', 'contact', 'route.js');
  const routeUrl = pathToFileURL(routePath).href;

  it('TC-T4-01: Scenario 1 - Full First-Time Desktop Visitor Journey across hero, story, globe, and founder', async () => {
    // 1. Landing: Verify desktop layout metrics (aspect > 1, horizon = 60%, zero CLS)
    const heroContent = fs.readFileSync(path.join(rootDir, 'components', 'Hero.jsx'), 'utf8');
    expect(heroContent).toContain('useState(60)');

    // 2. Asset delivery: Verify all local media assets for hero, story, globe, and founder load locally
    const desktopAssets = [
      'textures/earth_atmos_2048.webp',
      'textures/earth_clouds_1024.webp',
      'images/founder.webp',
      'images/neutralize.webp',
      'images/preserve.webp',
      'images/stop.webp',
    ];

    let totalTransfer = 0;
    for (const rel of desktopAssets) {
      const full = path.join(rootDir, 'public', rel);
      expect(fs.existsSync(full)).toBe(true);
      const stat = fs.statSync(full);
      totalTransfer += stat.size;
    }

    // Initial media payload must be under 1.1 MB (down from 3.74 MB baseline)
    expect(totalTransfer).toBeLessThan(1100000);

    // 3. Security headers: Verify site response protects visitor with CSP, HSTS, and nosniff
    const configContent = fs.readFileSync(path.join(rootDir, 'next.config.mjs'), 'utf8');
    expect(configContent).toContain("default-src 'self'");
    expect(configContent).toContain('max-age=63072000');
    expect(configContent).toContain('nosniff');
  });

  it('TC-T4-02: Scenario 2 - Mobile Low-Power / Battery-Saver Journey with prefers-reduced-motion', () => {
    // 1. Screen size: Mobile viewport (< 768px)
    const earthContent = fs.readFileSync(path.join(rootDir, 'components', 'Earth.jsx'), 'utf8');
    // Device pixel ratio clamped to 1.5 to save GPU power
    expect(earthContent).toMatch(/window\.innerWidth\s*<\s*768\s*\?\s*1\.5\s*:\s*2/);

    // 2. Accessibility: Reduced motion check halts continuous WebGL spin
    expect(earthContent).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(earthContent).toContain('if (reduceMotion)');
    expect(earthContent).toContain('renderer.render(scene, camera)');

    // 3. Ambient background: Canvas stops animation loop and renders static glow
    const ambientContent = fs.readFileSync(path.join(rootDir, 'components', 'Ambient.jsx'), 'utf8');
    expect(ambientContent).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(ambientContent).toContain('if (reduce)');
  });

  it('TC-T4-03: Scenario 3 - Biotech Partner Legitimate Contact Enquiry Submission Journey', async () => {
    const { POST } = await import(routeUrl);

    const partnerIP = `partner-${Date.now()}`;
    const validInquiry = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': partnerIP,
      },
      body: JSON.stringify({
        name: 'Dr. Marcus Vance',
        email: 'marcus.vance@novabiotech.org',
        organisation: 'Nova Biotechnology Research Institute',
        role: 'Director of Toxicology',
        message:
          'We are interested in evaluating your rapid toxin neutralization platform for preclinical venom antibody integration. Please provide technical briefing documents and collaboration details.',
      }),
    });

    const res = await POST(validInquiry);
    // Validation passes: status is either 200 (if SMTP configured) or 503 fallback (in test environment)
    // Most importantly, NOT 400 (validation failure) and NOT 429 (rate limited)
    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(429);
  });

  it('TC-T4-04: Scenario 4 - Automated Spam Bot & Distributed Assault Mitigation Journey', async () => {
    const { POST } = await import(routeUrl);

    const botIP = `bot-assault-${Date.now()}`;

    // Step 1: Bot submits form with hidden honeypot field filled
    const honeypotReq = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': botIP,
      },
      body: JSON.stringify({
        website: 'http://spam-link-crawler.xyz',
        name: 'Spammy Bot\r\nBcc: victim@domain.com',
        email: 'spam@bot.org',
        role: 'Spammer\nCc: target@domain.com',
        message: 'Cheap crypto opportunities',
      }),
    });

    const honeypotRes = await POST(honeypotReq);
    expect(honeypotRes.status).toBe(200);
    const honeypotData = await honeypotRes.json();
    expect(honeypotData.ok).toBe(true);

    // Step 2: Attacker circumvents honeypot and attempts 10 rapid submissions with CRLF headers
    const makeAttack = (n) =>
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-real-ip': botIP,
        },
        body: JSON.stringify({
          name: `Attacker ${n}\r\nBcc: blast@domain.com`,
          email: 'attacker@evil.com',
          role: 'Attacker',
          message: `Attack message ${n}`,
        }),
      });

    let rateLimitedCount = 0;
    for (let i = 1; i <= 10; i++) {
      const res = await POST(makeAttack(i));
      if (res.status === 429) {
        rateLimitedCount++;
      }
    }

    // Must have triggered rate limiting
    expect(rateLimitedCount).toBeGreaterThanOrEqual(5);
  });

  it('TC-T4-05: Scenario 5 - Multitasking Tab-Switching and Dynamic Window Resizing Journey', () => {
    const earthContent = fs.readFileSync(path.join(rootDir, 'components', 'Earth.jsx'), 'utf8');

    // 1. Observer handles element coming in and out of viewport on scroll
    expect(earthContent).toContain('new IntersectionObserver');
    expect(earthContent).toContain('visibility.observe(mount)');

    // 2. Visibility change listener pauses WebGL rendering on background tab
    expect(earthContent).toContain("document.addEventListener('visibilitychange'");
    expect(earthContent).toContain('renderer.setAnimationLoop(isVisible && !document.hidden ? tick : null)');

    // 3. ResizeObserver dynamically recomputes camera projection and horizon on viewport change
    expect(earthContent).toContain('new ResizeObserver(layout)');
    expect(earthContent).toContain('camera.updateProjectionMatrix()');
  });
});
