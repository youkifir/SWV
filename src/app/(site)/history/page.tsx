import CanvaEmbed from '@/components/CanvaEmbed';
import ScrollReveal from '@/components/ScrollReveal';

// Главы истории сервера. Чтобы добавить новую — просто добавь объект
// в этот массив. embedUrl бери из Canva: Поделиться → Экспорт → Встроить.
const CHAPTERS = [
  {
    title: 'GENESIS OF SWV — ГЛАВА Ⅰ',
    author: 'Миша Белоконь',
    embedUrl: 'https://www.canva.com/design/DAHJFHlTza8/9EWOPQzdqoEK88ujTegWRQ/watch?embed',
    viewUrl: 'https://www.canva.com/design/DAHJFHlTza8/9EWOPQzdqoEK88ujTegWRQ/watch',
    aspectRatio: '159.5745%',
  },
];

export default function HistoryPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <span className="pill accent">📜 История сервера</span>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginTop: 16 }}>
          Как всё начиналось
        </h1>
      </div>

      <div className="stack" style={{ gap: 56 }}>
        {CHAPTERS.map((chapter, i) => (
          <ScrollReveal key={chapter.embedUrl} delay={i * 80}>
            <div>
              <p className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Глава {i + 1}
              </p>
              <h2 style={{ fontSize: 24, marginTop: 4, marginBottom: 16 }}>{chapter.title}</h2>
              <CanvaEmbed
                embedUrl={chapter.embedUrl}
                viewUrl={chapter.viewUrl}
                aspectRatio={chapter.aspectRatio}
                author={chapter.author}
              />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </main>
  );
}
