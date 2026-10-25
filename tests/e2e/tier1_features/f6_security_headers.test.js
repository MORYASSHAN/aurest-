import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F6: HTTP Security Headers Hardening', () => {
  const rootDir = path.resolve(process.cwd());
  const configPath = path.join(rootDir, 'next.config.mjs');
  const configContent = fs.readFileSync(configPath, 'utf8');

  it('TC-F6-01: Content-Security-Policy enforces strict standard directives', () => {
    expect(configContent).toContain("default-src 'self'");
    expect(configContent).toContain("frame-ancestors 'none'");
    expect(configContent).toContain("object-src 'none'");
    expect(configContent).toContain("base-uri 'self'");
    expect(configContent).toContain("form-action 'self'");
    expect(configContent).toContain("upgrade-insecure-requests");
  });

  it('TC-F6-02: Strict-Transport-Security (HSTS) enforces 2-year preload standard', () => {
    // 2 years = 63,072,000 seconds
    expect(configContent).toContain('Strict-Transport-Security');
    expect(configContent).toContain('max-age=63072000');
    expect(configContent).toContain('includeSubDomains');
    expect(configContent).toContain('preload');
  });

  it('TC-F6-03: Cross-Origin isolation headers (COOP and CORP) are configured to same-origin', () => {
    expect(configContent).toContain("key: 'Cross-Origin-Opener-Policy'");
    expect(configContent).toContain("value: 'same-origin'");
    expect(configContent).toContain("key: 'Cross-Origin-Resource-Policy'");
  });

  it('TC-F6-04: MIME sniffing and clickjacking defense headers (X-Content-Type-Options and X-Frame-Options) are enforced', () => {
    expect(configContent).toContain("key: 'X-Content-Type-Options'");
    expect(configContent).toContain("value: 'nosniff'");
    expect(configContent).toContain("key: 'X-Frame-Options'");
    expect(configContent).toContain("value: 'DENY'");
  });

  it('TC-F6-05: Permissions-Policy restricts sensitive device APIs and browsing topics', () => {
    expect(configContent).toContain("key: 'Permissions-Policy'");
    expect(configContent).toContain('camera=()');
    expect(configContent).toContain('microphone=()');
    expect(configContent).toContain('geolocation=()');
    expect(configContent).toContain('browsing-topics=()');
  });
});
