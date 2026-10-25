import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, setTier } from '../helpers/harness.js';

setTier('Tier 1: Feature Coverage');

describe('F7: Contact API CRLF Header Injection Defense', () => {
  const rootDir = path.resolve(process.cwd());
  const routePath = path.join(rootDir, 'app', 'api', 'contact', 'route.js');
  const routeContent = fs.readFileSync(routePath, 'utf8');

  // Regex extraction and replication from route.js
  const sanitizeHeader = (s) => String(s || '').replace(/[\r\n\x00-\x1f]/g, ' ').trim();
  const sanitizeAddressPart = (s) => sanitizeHeader(s).replace(/[<>"']/g, '').trim();

  it('TC-F7-01: Strips carriage return \\r (%0D) characters from single-line header fields', () => {
    const maliciousName = 'Dr. Alice\rBcc: victim@example.com';
    const clean = sanitizeHeader(maliciousName);

    expect(clean).not.toContain('\r');
    expect(clean).toBe('Dr. Alice Bcc: victim@example.com');
  });

  it('TC-F7-02: Strips newline \\n (%0A) characters from single-line header fields', () => {
    const maliciousRole = 'Chief Scientist\nCc: spy@agency.org';
    const clean = sanitizeHeader(maliciousRole);

    expect(clean).not.toContain('\n');
    expect(clean).toBe('Chief Scientist Cc: spy@agency.org');
  });

  it('TC-F7-03: Strips null bytes (\\x00) and ASCII control characters (\\x01-\\x1F)', () => {
    const maliciousOrg = 'BioLab\x00\x08\x1b[31mInjected';
    const clean = sanitizeHeader(maliciousOrg);

    expect(clean).not.toContain('\x00');
    expect(clean).not.toContain('\x08');
    expect(clean).not.toContain('\x1b');
    expect(clean).toBe('BioLab   [31mInjected');
  });

  it('TC-F7-04: Strips quotes and angle brackets to protect replyTo header formatting', () => {
    const spoofedName = 'Admin" <admin@aurest.com>"';
    const cleanAddress = sanitizeAddressPart(spoofedName);

    expect(cleanAddress).not.toContain('"');
    expect(cleanAddress).not.toContain('<');
    expect(cleanAddress).not.toContain('>');
    expect(cleanAddress).toBe('Admin admin@aurest.com');
  });

  it('TC-F7-05: route.js implements sanitizeHeader and sanitizeAddressPart in email construction', () => {
    expect(routeContent).toContain('sanitizeHeader');
    expect(routeContent).toContain('sanitizeAddressPart');
    expect(routeContent).toMatch(/replace\(\/\[\\r\\n\\x00-\\x1f\]\/g/);
  });
});
