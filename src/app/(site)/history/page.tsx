// Раздел "История" полностью отдан под дизайн Canva — вместо своей ленты
// событий из базы (history_events там больше не используется на этой
// странице, хотя таблица и заявки на модерацию остаются в бэкенде на
// случай, если решите вернуть свою ленту).
//
// ЗАМЕНИ CANVA_EMBED_URL на реальную ссылку для встраивания:
// в Canva — Поделиться → Экспорт → Встроить, получится ссылка вида
// https://www.canva.com/design/XXXXX/view?embed

const CANVA_EMBED_URL = 'https://www.canva.com/design/DAHJFHlTza8/view?embed'; // TODO: заменить на реальную embed-ссылку

export default function HistoryPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 900, margin: '0 auto' }}>
      <p className="pill accent">История сервера</p>
      <h1 style={{ fontSize: 30, marginTop: 8, marginBottom: 24 }}>Как всё начиналось</h1>

      {/* Официальный адаптивный embed-контейнер Canva: отношение сторон
          держится через padding-top, iframe растягивается на всю ширину. */}
      <div style={{ position: 'relative', width: '100%', height: 0, paddingTop: '56.2225%', paddingBottom: 0, overflow: 'hidden', borderRadius: 12, willChange: 'transform' }}>
        <iframe
          loading="lazy"
          style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, border: 'none', padding: 0, margin: 0 }}
          src={CANVA_EMBED_URL}
          allow="fullscreen"
        />
      </div>
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
        <a href={CANVA_EMBED_URL.replace('?embed', '')} target="_blank" rel="noopener noreferrer">
          Открыть в Canva
        </a>
      </p>
    </main>
  );
}
