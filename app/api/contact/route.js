import nodemailer from 'nodemailer';

// Sends contact-form messages to the Aurest inbox via SMTP.
// Configure in .env.local (see .env.example):
//   SMTP_USER, SMTP_PASS (a Gmail App Password), optional CONTACT_TO, SMTP_HOST, SMTP_PORT

export const runtime = 'nodejs';

const CONTACT_TO = process.env.CONTACT_TO || 'aurestbiotech@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 120, email: 200, organisation: 160, role: 60, message: 5000 };

// In-memory rate limit with self-pruning: 5 messages per IP per 10 minutes
const hits = new Map();
function pruneHits(now) {
  if (hits.size > 200) {
    for (const [key, timestamps] of hits.entries()) {
      const valid = timestamps.filter((t) => now - t < 10 * 60 * 1000);
      if (valid.length === 0) hits.delete(key);
      else hits.set(key, valid);
    }
  }
}

function rateLimited(ip) {
  const now = Date.now();
  pruneHits(now);
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const escapeHtml = (s) =>
  String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Strips CR and LF to prevent CRLF email header injection
const sanitizeHeader = (s) => String(s || '').replace(/[\r\n\x00-\x1f]/g, ' ').trim();

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Bots fill the hidden honeypot field; pretend success and drop it
  if (body.website) return Response.json({ ok: true });

  const data = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    data[key] = String(body[key] ?? '').trim().slice(0, max);
  }

  if (!data.name || !data.email || !data.message) {
    return Response.json({ error: 'Please fill in your name, email and message.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(data.email) || data.email.length > LIMITS.email) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many messages. Please try again in a few minutes.' }, { status: 429 });
  }

  const { SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('[contact] SMTP_USER / SMTP_PASS are not set, so email cannot be sent.');
    return Response.json(
      { error: 'Our website form is not connected to email yet.', fallback: true },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const safeName = sanitizeHeader(data.name);
  const safeRole = sanitizeHeader(data.role);
  const safeEmail = sanitizeHeader(data.email);
  const subject = `New enquiry from ${safeName}${safeRole ? ` (${safeRole})` : ''}`;

  const rows = [
    ['Name', safeName],
    ['Email', safeEmail],
    ['Organisation', data.organisation || 'Not provided'],
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
      replyTo: `"${safeName.replace(/"/g, '')}" <${safeEmail}>`,
      subject,
      text,
      html,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[contact] sendMail failed:', err);
    return Response.json(
      { error: "We couldn't send your message from the website right now.", fallback: true },
      { status: 502 }
    );
  }
}
