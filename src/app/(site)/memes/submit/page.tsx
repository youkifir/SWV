'use client';

import { useState } from 'react';

export default function MemeSubmitPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setSending(true);
    setError(null);

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'meme',
        payload: { imageUrl: imageUrl.trim(), caption: caption.trim() || undefined },
        submitterName: submitterName.trim() || undefined,
      }),
    });
    const data = await res.json();

    if (!data.ok) {
      setError(data.error ?? 'Не удалось отправить заявку');
    } else {
      setDone(true);
    }
    setSending(false);
  }

  if (done) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="pill accent">Отправлено</p>
          <h1 style={{ fontSize: 24, marginTop: 12 }}>Спасибо!</h1>
          <p className="muted">Мем на модерации — появится в галерее после одобрения.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 480, margin: '0 auto' }}>
      <p className="pill accent">Мемы</p>
      <h1 style={{ fontSize: 28, marginTop: 12, marginBottom: 8 }}>Добавить мем</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Нужна ссылка на картинку (например, загрузи её на imgur.com и вставь ссылку сюда).
      </p>

      <form onSubmit={handleSubmit} className="card stack">
        <input
          type="url"
          placeholder="Ссылка на картинку"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <textarea
          placeholder="Подпись/контекст (необязательно)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
        />
        <input
          placeholder="Твоё имя (необязательно)"
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={sending || !imageUrl.trim()}>
          {sending ? 'Отправляем…' : 'Отправить на модерацию'}
        </button>
      </form>
    </main>
  );
}
