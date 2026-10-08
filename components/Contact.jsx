'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import SectionHeader from './SectionHeader';
import { contact } from '@/lib/content';

const EMPTY = { name: '', email: '', organisation: '', role: '', message: '', website: '' };

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const pickAudience = (title) => setForm((f) => ({ ...f, role: f.role === title ? '' : title }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="section section-white">
      <div className="container">
        <SectionHeader eyebrow={contact.eyebrow} title={contact.title} lead={contact.lead} />

        <div className="contact">
          {/* Who we want to hear from — clicking one pre-fills the form */}
          <div className="contact-side">
            <Reveal as="p" className="contact-hint">
              Who are you?
            </Reveal>
            <div className="audiences">
              {contact.audiences.map((a, i) => (
                <Reveal key={a.key} delay={0.08 * i}>
                  <button
                    type="button"
                    className={form.role === a.title ? 'audience active' : 'audience'}
                    aria-pressed={form.role === a.title}
                    onClick={() => pickAudience(a.title)}
                  >
                    <span className="audience-check" aria-hidden="true">
                      <svg viewBox="0 0 16 16">
                        <path d="M3.5 8.5l3 3 6-7" />
                      </svg>
                    </span>
                    <span>
                      <strong>{a.title}</strong>
                      <span>{a.text}</span>
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal as="ul" className="contact-info" delay={0.2}>
              <li>
                <span>Email</span>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <span>Location</span>
                {contact.location}
              </li>
              <li>
                <span>LinkedIn</span>
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                  Priyanshu Sharma
                </a>
              </li>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal className="contact-card" delay={0.1}>
            {status === 'sent' ? (
              <div className="form-success" role="status">
                <span className="success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M6 12.5l4 4 8-9" />
                  </svg>
                </span>
                <h3>Message sent</h3>
                <p>Thank you for reaching out. We'll get back to you soon.</p>
                <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate={false}>
                <p className="form-title">{contact.close}</p>

                <div className="form-row">
                  <label className="field">
                    <span>Name</span>
                    <input required name="name" autoComplete="name" value={form.name} onChange={update('name')} maxLength={120} />
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={update('email')}
                      maxLength={200}
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="field">
                    <span>Organisation <em>(optional)</em></span>
                    <input name="organisation" autoComplete="organization" value={form.organisation} onChange={update('organisation')} maxLength={160} />
                  </label>
                  <label className="field">
                    <span>I am</span>
                    <select name="role" value={form.role} onChange={update('role')}>
                      <option value="">Select one</option>
                      {contact.audiences.map((a) => (
                        <option key={a.key} value={a.title}>
                          {a.title}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </label>
                </div>

                <label className="field">
                  <span>Message</span>
                  <textarea required name="message" rows={5} value={form.message} onChange={update('message')} maxLength={5000} />
                </label>

                {/* Honeypot: hidden from people, catches bots */}
                <label className="hp" aria-hidden="true">
                  Website
                  <input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={update('website')} />
                </label>

                {status === 'error' && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending' : 'Send message'}
                  <svg viewBox="0 0 16 10" aria-hidden="true">
                    <path d="M1 5h13M10 1l4 4-4 4" />
                  </svg>
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
