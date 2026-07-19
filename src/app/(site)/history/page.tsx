import CanvaEmbed from '@/components/CanvaEmbed';

// ЗАМЕНИ на реальную embed-ссылку: Canva → Поделиться → Экспорт → Встроить
const CANVA_EMBED_URL = 'https://www.canva.com/design/DAHJFHlTza8/view?embed';

export default function HistoryPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 900, margin: '0 auto' }}>
      <p className="pill accent">История сервера</p>
      <h1 style={{ fontSize: 30, marginTop: 8, marginBottom: 24 }}>Как всё начиналось</h1>
      <CanvaEmbed embedUrl={CANVA_EMBED_URL} />
    </main>
  );
}
