import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '@/styles/globals.css';

const displayFont = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
});

const body = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'SWV',
  description: 'SWAG Awards и жизнь сервера',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
};

// Скрипт выполняется до отрисовки страницы (blocking), чтобы не было
// вспышки неправильной темы при загрузке — читает сохранённый выбор
// или системную тему и сразу проставляет атрибут на <html>.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('swv-theme');
    var theme = saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${body.variable}`} data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
