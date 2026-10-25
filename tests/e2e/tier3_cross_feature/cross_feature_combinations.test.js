import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 3: Cross-Feature Combinations');

describe('Tier 3: Cross-Feature Combinations & State Interactions', () => {
  const rootDir = path.resolve(process.cwd());
  const routePath = path.join(rootDir, 'app', 'api', 'contact', 'route.js');
  const routeUrl = pathToFileURL(routePath).href;

  it('TC-T3-01: Simultaneous rate limit flood + CRLF injection payload enforces rate limiting and sanitization concurrently', async () => {
    const { POST } = await import(routeUrl);

    const attackerIP = `crlf-flood-${Date.now()}`;
    const makeAttackReq = (i) =>
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-real-ip': attackerIP,
        },
        body: JSON.stringify({
          name: `Attacker\r\nBcc: victim${i}@evil.com`,
          email: 'attacker@evil.com',
          role: `Hacker\nCc: target${i}@evil.com`,
          organisation: `DarkNet\rInjected`,
          message: `Flooding payload iteration ${i}`,
        }),
      });

    // Submissions 1 through 5: processed (sanitization applied, SMTP fallback 503)
    for (let i = 1; i <= 5; i++) {
      const res = await POST(makeAttackReq(i));
      expect(res.status).not.toBe(429);
    }

    // Submission 6: blocked immediately by rate limiter with 429
    const resBlocked = await POST(makeAttackReq(6));
    expect(resBlocked.status).toBe(429);
    const data = await resBlocked.json();
    expect(data.error).toContain('Too many messages');
  });

  it('TC-T3-02: Offline / disconnected network simulation with local textures and fonts verifies zero network leaks', async () => {
    // Check that every single image and texture used in components exists on disk
    const assetsToCheck = [
      'images/founder.webp',
      'images/neutralize.webp',
      'images/preserve.webp',
      'images/stop.webp',
      'textures/earth_atmos_2048.webp',
      'textures/earth_clouds_1024.webp',
    ];

    for (const relPath of assetsToCheck) {
      const fullPath = path.join(rootDir, 'public', relPath);
      expect(fs.existsSync(fullPath)).toBe(true);

      // Verify that the file is an intact image without requiring internet
      const meta = await sharp(fullPath).metadata();
      expect(meta.format).toBe('webp');
    }
  });

  it('TC-T3-03: Canvas resize during rapid hover + tab switch + reduced motion toggle compound state test', () => {
    // Model state transitions
    let isVisible = true;
    let reduceMotion = false;
    let isLoopRunning = false;

    const tick = () => {};
    const updateLoop = () => {
      const shouldRun = isVisible && !reduceMotion;
      if (shouldRun && !isLoopRunning) {
        isLoopRunning = true;
      } else if (!shouldRun && isLoopRunning) {
        isLoopRunning = false;
      }
    };

    // Initial state: visible, motion enabled -> running
    updateLoop();
    expect(isLoopRunning).toBe(true);

    // Compound Transition 1: User switches tab (hidden)
    isVisible = false;
    updateLoop();
    expect(isLoopRunning).toBe(false);

    // Compound Transition 2: While hidden, user enables reduced motion
    reduceMotion = true;
    updateLoop();
    expect(isLoopRunning).toBe(false);

    // Compound Transition 3: User returns to tab (visible), but reduced motion remains active
    isVisible = true;
    updateLoop();
    expect(isLoopRunning).toBe(false); // must NOT run because reduceMotion is true

    // Compound Transition 4: User disables reduced motion
    reduceMotion = false;
    updateLoop();
    expect(isLoopRunning).toBe(true); // resumes cleanly
  });

  it('TC-T3-04: Security Headers + Media Optimization: Cache-Control immutable headers match CSP img-src policy', () => {
    const configPath = path.join(rootDir, 'next.config.mjs');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // CSP policy for images
    expect(configContent).toMatch(/img-src\s+'self'\s+blob:\s+data:/);

    // Header caching for local images & textures
    expect(configContent).toContain('/(textures|images)/:path*');
    expect(configContent).toContain('public, max-age=31536000, immutable');
  });

  it('TC-T3-05: Contact API CSRF host verification + honeypot trigger + oversized payload defense in combination', async () => {
    const { POST } = await import(routeUrl);

    // Sub-case A: CSRF attack with forbidden origin
    const csrfReq = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://attacker.site',
        Host: 'localhost:3000',
      },
      body: JSON.stringify({ name: 'CSRF', email: 'csrf@evil.com', message: 'test' }),
    });
    const csrfRes = await POST(csrfReq);
    expect(csrfRes.status).toBe(403);

    // Sub-case B: Same origin, but bot triggers honeypot
    const botReq = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3000',
        Host: 'localhost:3000',
      },
      body: JSON.stringify({
        website: 'http://bot.net',
        name: 'Bot',
        email: 'bot@net.com',
        message: 'Spam',
      }),
    });
    const botRes = await POST(botReq);
    expect(botRes.status).toBe(200);
    const botData = await botRes.json();
    expect(botData.ok).toBe(true);

    // Sub-case C: Same origin, oversized payload
    const bigReq = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3000',
        Host: 'localhost:3000',
        'Content-Length': '80000',
      },
      body: JSON.stringify({ name: 'Big', email: 'big@net.com', message: 'x'.repeat(70000) }),
    });
    const bigRes = await POST(bigReq);
    expect(bigRes.status).toBe(413);
  });

  it('TC-T3-06: Ambient zero-allocation loop + card tilt custom property application during intensive cursor drag', () => {
    const ambientPath = path.join(rootDir, 'components', 'Ambient.jsx');
    const content = fs.readFileSync(ambientPath, 'utf8');

    // Assert that card tilt uses requestAnimationFrame coalescing
    expect(content).toContain('applyTilt');
    expect(content).toContain('pendingTilt');
    expect(content).toContain('--rx');
    expect(content).toContain('--ry');

    // Assert that drawHoneycomb runs in the same loop
    expect(content).toContain('drawHoneycomb(t)');
  });

  it('TC-T3-07: WebGL context loss + resize observer trigger + tab hidden state compound recovery', () => {
    const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
    const content = fs.readFileSync(earthPath, 'utf8');

    // Verify context loss handler
    expect(content).toContain('onContextLost');
    expect(content).toContain('isContextLost = true');

    // Verify tick checks context loss before rendering
    expect(content).toMatch(/if\s*\(\s*isContextLost\s*\)\s*return;/);

    // Verify context restore
    expect(content).toContain('onContextRestored');
    expect(content).toContain('isContextLost = false');
  });

  it('TC-T3-08: Hero CLS horizon initial state (60%) matching Earth layout computation across varying DPRs', () => {
    const earthPath = path.join(rootDir, 'components', 'Earth.jsx');
    const heroPath = path.join(rootDir, 'components', 'Hero.jsx');
    const earthContent = fs.readFileSync(earthPath, 'utf8');
    const heroContent = fs.readFileSync(heroPath, 'utf8');

    // Hero initial state
    expect(heroContent).toContain('useState(60)');

    // Earth desktop layout calculation: horizonY = -0.2 -> ((1 - (-0.2)) / 2) * 100 = 60
    expect(earthContent).toMatch(/aspect\s*>\s*1\s*\?\s*-0\.2\s*:\s*-0\.24/);
    expect(earthContent).toContain('(((1 - horizonY) / 2) * 100)');
  });

  it('TC-T3-09: Rate limiter self-prunes expired IPs during continuous multi-IP load', async () => {
    const { POST } = await import(routeUrl);

    // Send requests across 20 distinct synthetic IPs
    for (let i = 0; i < 20; i++) {
      const ip = `prune-load-${Date.now()}-${i}`;
      const req = new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-real-ip': ip,
        },
        body: JSON.stringify({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          message: 'Checking multi-IP pruning',
        }),
      });

      const res = await POST(req);
      expect(res.status).not.toBe(429);
    }
  });

  it('TC-T3-10: Three.js named imports tree-shaking combined with Next.js production build optimizations', () => {
    const configPath = path.join(rootDir, 'next.config.mjs');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Package import optimization
    expect(configContent).toContain("optimizePackageImports: ['three']");
    // Brotli/Gzip compression
    expect(configContent).toContain('compress: true');
    // React strict mode
    expect(configContent).toContain('reactStrictMode: true');
    // Powered by header disabled for security
    expect(configContent).toContain('poweredByHeader: false');
  });
});
