import Link from 'next/link';

const SECTIONS = [
  { href: '/awards', title: 'SWAG Awards', description: 'Голосование за номинации сервера' },
  { href: '/glossary', title: 'Глоссарий', description: 'Кто есть кто на сервере' },
  { href: '/iceberg', title: 'Айсберг', description: 'Чем глубже, тем инсайдернее' },
  { href: '/history', title: 'История', description: 'Ключевые события сервера' },
  { href: '/memes', title: 'Мемы', description: 'Локальная классика' },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', padding: '64px 24px', maxWidth: 900, margin: '0 auto' }}>
      <p className="pill accent">SWV</p>
      <h1 style={{ fontSize: 40, marginTop: 12, marginBottom: 32 }}>Сайт сервера</h1>

      <div className="stack" style={{ gap: 12 }}>
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} style={{ textDecoration: 'none' }}>
            <div className="card spread">
              <div>
                <p style={{ fontWeight: 500, fontSize: 18 }}>{section.title}</p>
                <p className="muted">{section.description}</p>
              </div>
              <span className="muted">→</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
