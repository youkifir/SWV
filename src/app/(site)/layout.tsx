import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';

const LINKS = [
  { href: '/awards', label: 'SWAG Awards' },
  { href: '/glossary', label: 'Глоссарий' },
  { href: '/iceberg', label: 'Айсберг' },
  { href: '/history', label: 'История' },
  { href: '/memes', label: 'Мемы' },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/logo.png" alt="SWV" width={32} height={32} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>SWV</span>
        </Link>

        <nav className="site-header-links">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>

        <ThemeToggle />
      </header>
      {children}
    </>
  );
}
