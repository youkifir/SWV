'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      const goingDown = currentY > lastScrollY.current;
      const pastThreshold = currentY > 80;

      // Скрываем только когда листают вниз и уже прошли шапку;
      // при скролле вверх (или у самого верха страницы) — сразу показываем.
      setHidden(goingDown && pastThreshold);
      lastScrollY.current = currentY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`site-header ${hidden ? 'site-header--hidden' : ''}`}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <Image src="/logo.png" alt="SWV" width={32} height={32} />
        <span className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>SWV</span>
      </Link>

      <nav className="site-header-links">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>

      <ThemeToggle />
      <a href="https://discord.gg/7MHRxghSTR" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <button className="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          💬 Discord
        </button>
      </a>
    </header>
  );
}
