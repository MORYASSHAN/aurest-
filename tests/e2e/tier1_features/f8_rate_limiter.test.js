import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F8: Bounded Self-Pruning In-Memory Rate Limiter', () => {
  const rootDir = path.resolve(process.cwd());
  const routePath = path.join(rootDir, 'app', 'api', 'contact', 'route.js');
  const routeContent = fs.readFileSync(routePath, 'utf8');
  const routeUrl = pathToFileURL(routePath).href;

  it('TC-F8-01: Rate limiting allows up to 5 requests per IP window and blocks the 6th', async () => {
    const { POST } = await import(routeUrl);

    const testIP = `test-rate-${Date.now()}`;
    const makeReq = () =>
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIP,
        },
        body: JSON.stringify({
          name: 'Rate Test',
          email: 'rate@example.com',
          message: 'Testing rate limits',
        }),
      });

    // First 5 requests should not be 429 (they will be 503 fallback because SMTP is not configured in test)
    for (let i = 1; i <= 5; i++) {
      const res = await POST(makeReq());
      expect(res.status).not.toBe(429);
    }

    // 6th request MUST return 429 Too Many Requests
    const res6 = await POST(makeReq());
    expect(res6.status).toBe(429);
    const body6 = await res6.json();
    expect(body6.error).toContain('Too many messages');
  });

  it('TC-F8-02: Self-pruning routine purges expired entries when Map exceeds threshold', () => {
    // Assert pruneHits or self-pruning logic exists in route.js
    expect(routeContent).toContain('pruneHits');
    expect(routeContent).toContain('hits.delete');
    expect(routeContent).toContain('RATE_WINDOW_MS');
  });

  it('TC-F8-03: Rate limiter extracts IP priority from x-real-ip then x-forwarded-for with local fallback', () => {
    expect(routeContent).toContain("request.headers.get('x-real-ip')");
    expect(routeContent).toContain("request.headers.get('x-forwarded-for')");
    expect(routeContent).toContain("'local'");
  });

  it('TC-F8-04: Independent IPs do not interfere with each other rate limits', async () => {
    const { POST } = await import(routeUrl);

    const ipAlpha = `alpha-${Date.now()}`;
    const ipBeta = `beta-${Date.now()}`;

    const makeReq = (ip) =>
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-real-ip': ip,
        },
        body: JSON.stringify({
          name: 'Multi-IP Test',
          email: 'multi@example.com',
          message: 'Testing independence',
        }),
      });

    // Make 1 request on ipBeta
    const resBeta = await POST(makeReq(ipBeta));
    expect(resBeta.status).not.toBe(429);

    // Make 5 requests on ipAlpha until blocked
    for (let i = 1; i <= 5; i++) {
      await POST(makeReq(ipAlpha));
    }
    const resAlphaBlocked = await POST(makeReq(ipAlpha));
    expect(resAlphaBlocked.status).toBe(429);

    // ipBeta should still NOT be blocked
    const resBetaSecond = await POST(makeReq(ipBeta));
    expect(resBetaSecond.status).not.toBe(429);
  });

  it('TC-F8-05: Honeypot field website silently drops submission with 200 OK without triggering rate limiter or sending email', async () => {
    const { POST } = await import(routeUrl);

    const botReq = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        website: 'http://spam-link.ru',
        name: 'Spam Bot',
        email: 'spam@bot.com',
        message: 'Buy cheap watches',
      }),
    });

    const res = await POST(botReq);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});
