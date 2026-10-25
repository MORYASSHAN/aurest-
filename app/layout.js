import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
});

// Public URL used for absolute links in social previews.
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
    'Venom Seal',
    'Aurest Kage',
    'drug delivery',
    'Jaipur',
    'MNIT',
    'deep-tech',
  ],
  authors: [{ name: 'Priyanshu Sharma', url: siteUrl }],
  creator: 'Priyanshu Sharma',
  publisher: 'Aurest Biotech Pvt. Ltd.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Aurest Biotech',
    title: 'Aurest Biotech',
    description,
    locale: 'en_IN',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurest Biotech',
    description,
    creator: '@itzpriyn',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e2eefa',
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <link
          rel="preload"
          href="/textures/earth_atmos_2048.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

