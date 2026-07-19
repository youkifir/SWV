import Link from 'next/link';
import Image from 'next/image';

const SECTIONS = [
  { href: '/awards', title: 'SWAG Awards', description: 'Голосование за номинации сервера', emoji: '🏆' },
  { href: '/glossary', title: 'Глоссарий', description: 'Кто есть кто на сервере', emoji: '📖' },
  { href: '/iceberg', title: 'Айсберг', description: 'Чем глубже, тем инсайдернее', emoji: '🧊' },
  { href: '/history', title: 'История', description: 'Ключевые события сервера', emoji: '📜' },
  { href: '/memes', title: 'Мемы', description: 'Локальная классика', emoji: '😂' },
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
                <span style={{ fontSize: 28 }}>{section.emoji}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500 }}>{section.title}</p>
                  <p className="muted">{section.description}</p>
                </div>
              </div>
              <span className="muted">→</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
