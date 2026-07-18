import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '@/styles/globals.css';

const displayFont = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  weight: ['600', '700'],
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'SWV',
  description: 'SWAG Awards и жизнь сервера',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
