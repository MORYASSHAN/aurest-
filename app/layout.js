import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-manrope',
});

// Public URL used for absolute links in social previews.
// Set NEXT_PUBLIC_SITE_URL in Vercel once you have a custom domain; otherwise Vercel's URL is used.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:3000';

const description = 'Advanced biotechnology for the moments when medicine has seconds to act.';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Aurest Biotech',
    template: '%s | Aurest Biotech',
  },
  description,
  keywords: [
    'Aurest',
    'Aurest Biotech',
    'biotechnology',
    'hemostatic',
    'V Seal',
    'drug delivery',
    'Jaipur',
    'MNIT',
    'deep-tech',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Aurest Biotech',
    title: 'Aurest Biotech',
    description,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurest Biotech',
    description,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e2eefa',
  viewportFit: 'cover', // lets the page use the full screen on notched phones
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
