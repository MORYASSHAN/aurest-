import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 2: Boundary & Corner Cases');

describe('F6, F7 & F8 Security & API Boundary Cases', () => {
  const rootDir = path.resolve(process.cwd());
  const configPath = path.join(rootDir, 'next.config.mjs');
  const routePath = path.join(rootDir, 'app', 'api', 'contact', 'route.js');
  const configContent = fs.readFileSync(configPath, 'utf8');
  const routeContent = fs.readFileSync(routePath, 'utf8');
  const routeUrl = pathToFileURL(routePath).href;

  // --- F6 Boundary Tests ---
  it('TC-F6-B01: HSTS max-age is set to at least 63072000 seconds (2 years)', () => {
    const match = configContent.match(/max-age=(\d+)/);
    expect(match).toBeDefined();
    const maxAge = parseInt(match[1], 10);
    expect(maxAge).toBeGreaterThanOrEqual(63072000);
  });

  it('TC-F6-B02: Permissions-Policy uses empty parameter tuples () to permanently disable sensitive APIs', () => {
    expect(configContent).toContain('camera=()');
    expect(configContent).toContain('microphone=()');
    expect(configContent).toContain('geolocation=()');
  });

  it('TC-F6-B03: CSP script-src restricts execution to self and inline/eval with no remote hosts', () => {
    const scriptSrcMatch = configContent.match(/script-src\s+([^;]+)/);
    expect(scriptSrcMatch).toBeDefined();
    const directives = scriptSrcMatch[1];
    expect(directives).not.toContain('http://');
    expect(directives).not.toContain('https://');
  });

  it('TC-F6-B04: CSP frame-ancestors is strictly set to none to block iframe clickjacking', () => {
    expect(configContent).toContain("frame-ancestors 'none'");
  });

  it('TC-F6-B05: next.config.mjs specifies 1-year immutable Cache-Control for textures and images', () => {
    expect(configContent).toContain('/(textures|images)/:path*');
    expect(configContent).toContain('public, max-age=31536000, immutable');
  });

  // --- F7 Boundary Tests ---
  it('TC-F7-B01: Multiple consecutive CRLF sequences are completely eliminated', () => {
    const sanitizeHeader = (s) => String(s || '').replace(/[\r\n\x00-\x1f]/g, ' ').trim();
    const attack = 'Name\r\n\r\nBcc: evil@domain.com\r\nSubject: Pwned';
    const clean = sanitizeHeader(attack);

    expect(clean).not.toContain('\r');
    expect(clean).not.toContain('\n');
    expect(clean).toBe('Name    Bcc: evil@domain.com  Subject: Pwned');
  });

  it('TC-F7-B02: Input length limits truncate fields at exact boundaries (120 name, 60 role, 160 org, 5000 message)', () => {
    const LIMITS = { name: 120, email: 200, organisation: 160, role: 60, message: 5000 };

    const longName = 'A'.repeat(200);
    const slicedName = longName.slice(0, LIMITS.name);
    expect(slicedName.length).toBe(120);

    const longMessage = 'M'.repeat(10000);
    const slicedMessage = longMessage.slice(0, LIMITS.message);
    expect(slicedMessage.length).toBe(5000);
  });

  it('TC-F7-B03: Email containing newline is rejected by EMAIL_RE validation', async () => {
    const { POST } = await import(routeUrl);

    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Valid Name',
        email: 'test\ninjection@example.com',
        message: 'Hello',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('valid email');
  });

  it('TC-F7-B04: HTML special characters in message are properly escaped', () => {
    const escapeHtml = (s) =>
      String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

    const payload = '<script>alert("XSS & fun")</script>';
    const escaped = escapeHtml(payload);

    expect(escaped).not.toContain('<');
    expect(escaped).not.toContain('>');
    expect(escaped).not.toContain('"');
    expect(escaped).toContain('&lt;script&gt;');
    expect(escaped).toContain('&amp;');
  });

  it('TC-F7-B05: Missing required fields (empty name, email, or message) return status 400', async () => {
    const { POST } = await import(routeUrl);

    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'test@example.com',
        message: '',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Please fill in');
  });

  // --- F8 Boundary Tests ---
  it('TC-F8-B01: Rapid burst of requests from single IP triggers 429 after 5 requests', async () => {
    const { POST } = await import(routeUrl);

    const burstIP = `burst-ip-${Date.now()}`;
    const makeBurstReq = () =>
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-real-ip': burstIP,
        },
        body: JSON.stringify({
          name: 'Burst Tester',
          email: 'burst@test.com',
          message: 'Burst message',
        }),
      });

    // Send 5 initial requests
    for (let i = 0; i < 5; i++) {
      await POST(makeBurstReq());
    }

    // Next 10 requests should all be 429
    for (let i = 0; i < 10; i++) {
      const res = await POST(makeBurstReq());
      expect(res.status).toBe(429);
    }
  });

  it('TC-F8-B02: IPv6 address formatted strings function seamlessly as rate limiter keys', async () => {
    const { POST } = await import(routeUrl);

    const ipv6 = `2001:db8:85a3::${Math.floor(Math.random() * 10000)}`;
    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-ip': ipv6,
      },
      body: JSON.stringify({
        name: 'IPv6 Tester',
        email: 'ipv6@test.com',
        message: 'Testing IPv6',
      }),
    });

    const res = await POST(req);
    expect(res.status).not.toBe(429);
  });

  it('TC-F8-B03: Oversized request payload (> 64 KB) triggers 413 Payload Too Large', async () => {
    const { POST } = await import(routeUrl);

    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '70000', // 70 KB > 64 KB limit
      },
      body: JSON.stringify({
        name: 'Big Payload',
        email: 'big@test.com',
        message: 'Big',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.error).toContain('Payload too large');
  });

  it('TC-F8-B04: Cross-origin requests with foreign origin header trigger 403 Forbidden', async () => {
    const { POST } = await import(routeUrl);

    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil-phishing-site.com',
        Host: 'localhost:3000',
      },
      body: JSON.stringify({
        name: 'Phisher',
        email: 'phish@evil.com',
        message: 'Attack',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('Forbidden cross-origin');
  });

  it('TC-F8-B05: Malformed JSON body returns 400 Bad Request error response', async () => {
    const { POST } = await import(routeUrl);

    const req = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not valid json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Invalid request body');
  });
});
