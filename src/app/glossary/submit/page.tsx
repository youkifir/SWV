'use client';

import { useState } from 'react';

export default function GlossarySubmitPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSending(true);
    setError(null);

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'member',
        payload: { name: name.trim(), description: description.trim() || undefined, avatarUrl: avatarUrl.trim() || undefined },
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
          <p className="muted">Заявка на модерации — появится в глоссарии после одобрения.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 480, margin: '0 auto' }}>
      <p className="pill accent">Глоссарий</p>
      <h1 style={{ fontSize: 28, marginTop: 12, marginBottom: 24 }}>Предложить участника</h1>

      <form onSubmit={handleSubmit} className="card stack">
        <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea
          placeholder="Короткое описание (необязательно)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <input
          type="url"
          placeholder="Ссылка на фото (необязательно)"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
        <input
          placeholder="Твоё имя, чтобы мы знали от кого (необязательно)"
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={sending || !name.trim()}>
          {sending ? 'Отправляем…' : 'Отправить на модерацию'}
        </button>
      </form>
    </main>
  );
}
