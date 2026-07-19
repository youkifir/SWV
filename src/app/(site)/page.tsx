import Link from 'next/link';
import Image from 'next/image';

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
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Image src="/logo.png" alt="SWV" width={96} height={96} style={{ margin: '0 auto' }} />
        <h1 style={{ fontSize: 40, marginTop: 20 }}>SWV</h1>
        <div className="crest-divider" />
        <p className="muted">Сайт сервера</p>
      </div>

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
