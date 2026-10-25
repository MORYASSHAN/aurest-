import nodemailer from 'nodemailer';

// Sends contact-form messages to the Aurest inbox via SMTP.
// Configure in .env.local (see .env.example):
//   SMTP_USER, SMTP_PASS (a Gmail App Password), optional CONTACT_TO, SMTP_HOST, SMTP_PORT

export const runtime = 'nodejs';

const CONTACT_TO = process.env.CONTACT_TO || 'aurestbiotech@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 120, email: 200, organisation: 160, role: 60, message: 5000 };
const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB max payload to prevent DoS
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

// In-memory rate limit with self-pruning
const hits = new Map();

function pruneHits(now) {
  if (hits.size > 150) {
    for (const [key, timestamps] of hits.entries()) {
      const valid = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
      if (valid.length === 0) hits.delete(key);
      else hits.set(key, valid);
    }
  }
}

function rateLimited(ip) {
  const now = Date.now();
  pruneHits(now);
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const escapeHtml = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Strips CR, LF and control characters to prevent CRLF email header injection
const sanitizeHeader = (s) => String(s || '').replace(/[\r\n\x00-\x1f]/g, ' ').trim();

// Strip brackets and quotes for header addresses
const sanitizeAddressPart = (s) => sanitizeHeader(s).replace(/[<>"']/g, '');

const jsonResponse = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
    },
  });

export async function POST(request) {
  // Guard against oversized payload attacks
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return jsonResponse({ error: 'Payload too large.' }, 413);
  }

  // Verify origin for CSRF defense if present
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return jsonResponse({ error: 'Forbidden cross-origin submission.' }, 403);
      }
    } catch {
      return jsonResponse({ error: 'Invalid origin header.' }, 403);
    }
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  // Bots fill the hidden honeypot field; pretend success and drop it immediately
  if (body.website) return jsonResponse({ ok: true });

  const data = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    data[key] = String(body[key] ?? '').trim().slice(0, max);
  }

  if (!data.name || !data.email || !data.message) {
    return jsonResponse({ error: 'Please fill in your name, email and message.' }, 400);
  }
  if (!EMAIL_RE.test(data.email) || data.email.length > LIMITS.email) {
    return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
  }

  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'local';

  if (rateLimited(ip)) {
    return jsonResponse({ error: 'Too many messages. Please try again in a few minutes.' }, 429);
  }

  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('[contact] SMTP_USER / SMTP_PASS are not set, so email cannot be sent.');
    return jsonResponse(
      { error: 'Our website form is not connected to email yet.', fallback: true },
      503
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const safeName = sanitizeAddressPart(data.name);
  const safeRole = sanitizeHeader(data.role);
  const safeEmail = sanitizeAddressPart(data.email);
  const subject = `New enquiry from ${safeName}${safeRole ? ` (${safeRole})` : ''}`;

  const rows = [
    ['Name', safeName],
    ['Email', safeEmail],
    ['Organisation', sanitizeHeader(data.organisation) || 'Not provided'],
    ['I am', safeRole || 'Not provided'],
  ];

  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessage:\n${data.message}\n`;
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#18232f">
      <h2 style="margin:0 0 12px">New website enquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="color:#556476"><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`
          )
          .join('')}
      </table>
      <p style="margin:16px 0 4px;color:#556476"><strong>Message</strong></p>
      <p style="white-space:pre-wrap;margin:0">${escapeHtml(data.message)}</p>
    </div>`;

  try {
    await transporter.sendMail({
      from: `"Aurest Website" <${SMTP_USER}>`,
      to: CONTACT_TO,
      replyTo: `"${safeName}" <${safeEmail}>`,
      subject,
      text,
      html,
    });
    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('[contact] sendMail failed:', err);
    return jsonResponse(
      { error: "We couldn't send your message from the website right now.", fallback: true },
      502
    );
  }
}

