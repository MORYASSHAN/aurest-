import { contact } from '@/lib/content';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#technology', label: 'Technology' },
  { href: '#vision', label: 'Vision' },
  { href: '#founder', label: 'Founder' },
  { href: '#contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-col">
          <p className="footer-name">Aurest Biotech Pvt. Ltd.</p>
          <p>{contact.location}</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="footer-col footer-right">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <p>© {new Date().getFullYear()} Aurest Biotech Pvt. Ltd.</p>
        </div>
      </div>

      <p className="footer-word" aria-hidden="true">
        AUREST
      </p>
    </footer>
  );
}
