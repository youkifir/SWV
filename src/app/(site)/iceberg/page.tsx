import CanvaEmbed from '@/components/CanvaEmbed';

// ЗАМЕНИ на реальную embed-ссылку: Canva → Поделиться → Экспорт → Встроить
const CANVA_EMBED_URL = 'https://www.canva.com/design/DAHPc_OwIZU/twU5BcYpBjyK9_d0Ciea5w/view';

export default function IcebergPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 900, margin: '0 auto' }}>
      <p className="pill accent">Айсберг сервера</p>
      <h1 style={{ fontSize: 30, marginTop: 8, marginBottom: 24 }}>Чем глубже, тем инсайдернее</h1>
      <CanvaEmbed embedUrl={CANVA_EMBED_URL} />
    </main>
  );
}
