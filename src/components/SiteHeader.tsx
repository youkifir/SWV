'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import Icon from '@/components/Icon';

const LINKS = [
  { href: '/awards', label: 'SWAG Awards' },
  { href: '/iceberg', label: 'Айсберг' },
  { href: '/history', label: 'История' },
  { href: '/dota', label: 'Dota 2' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    setSolid(window.scrollY > 20);

    function handleScroll() {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollY.current;

      // Прячем шапку при прокрутке вниз, возвращаем при прокрутке вверх.
      // Фон у неё появляется только когда страница уже прокручена.
      setHidden(goingDown && currentY > 80);
      setSolid(currentY > 20);
      lastScrollY.current = currentY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`site-header ${solid ? 'site-header--solid' : ''} ${hidden ? 'site-header--hidden' : ''}`}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <Image src="/logo.png" alt="SWV" width={38} height={38} />
        <span className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>SWV</span>
      </Link>

      <div className="site-header-right">
        <nav className="site-header-links">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href || pathname.startsWith(link.href + '/') ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
        <a href="https://discord.gg/7MHRxghSTR" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button className="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="chat" size={16} />
            Discord
          </button>
        </a>
      </div>
    </header>
  );
}
