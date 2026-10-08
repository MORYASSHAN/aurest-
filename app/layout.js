import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata = {
  title: 'Aurest',
  description: 'Advanced biotechnology for the moments when medicine has seconds to act.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f3f6f9',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}
