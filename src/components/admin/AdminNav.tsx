'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

const LINKS = [
  { href: '/admin', label: 'Дашборд' },
  { href: '/admin/nominations', label: 'Номинации' },
  { href: '/admin/codes', label: 'Коды' },
  { href: '/admin/results', label: 'Результаты' },
  { href: '/admin/votes', label: 'Кто как голосовал' },
  { href: '/admin/submissions', label: 'Заявки' },
  { href: '/admin/seasons', label: 'Сезоны' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <nav className="admin-nav">
      <div className="row admin-nav-brand" style={{ gap: 8 }}>
        <Image src="/logo.png" alt="" width={22} height={22} />
        <span className="pill accent">SWV Admin</span>
      </div>

      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              color: active ? 'var(--text)' : 'var(--text-muted)',
              background: active ? 'var(--surface-raised)' : 'transparent',
              fontWeight: active ? 500 : 400,
            }}
          >
            {link.label}
          </Link>
        );
      })}

      <div className="row" style={{ marginTop: 24 }}>
        <ThemeToggle />
        <button className="secondary" onClick={handleLogout}>Выйти</button>
      </div>
    </nav>
  );
}
