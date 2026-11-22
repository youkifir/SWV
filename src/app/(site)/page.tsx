import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/Icon';

const SECTIONS = [
  { href: '/awards', title: 'SWAG Awards', description: 'Голосование за номинации сервера', icon: 'trophy' as const },
  { href: '/iceberg', title: 'Айсберг', description: 'Чем глубже, тем инсайдернее', icon: 'iceberg' as const },
  { href: '/history', title: 'История', description: 'Ключевые события сервера', icon: 'scroll' as const },
  { href: '/dota', title: 'Dota 2', description: 'Ранги участников сервера', icon: 'gamepad' as const },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <Image src="/logo.png" alt="SWV" width={80} height={80} style={{ margin: '0 auto', display: 'block' }} />
        <h1 className="gradient-text" style={{ fontSize: 56, marginTop: 24 }}>SWV</h1>
        <p className="muted" style={{ fontSize: 15, marginTop: 8 }}>Сайт сервера — всё в одном месте</p>
      </div>

      <div className="stack" style={{ gap: 14 }}>
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} style={{ textDecoration: 'none' }}>
            <div className="card card-link spread">
              <div className="row">
                <span
                  style={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    color: 'var(--accent)',
                    background: 'var(--surface-raised)',
                  }}
                >
                  <Icon name={section.icon} size={24} />
                </span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>{section.title}</p>
                  <p className="muted">{section.description}</p>
                </div>
              </div>
              <span className="muted"><Icon name="arrow" size={18} /></span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
