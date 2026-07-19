import type { Metadata } from 'next';
import { Yeseva_One, Inter } from 'next/font/google';
import '@/styles/globals.css';

const displayFont = Yeseva_One({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  weight: '400',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'SWV',
  description: 'SWAG Awards и жизнь сервера',
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
    <html lang="ru" className={`${displayFont.variable} ${inter.variable}`} data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
