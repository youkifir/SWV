'use client';

import { useState } from 'react';

const EXAMPLE = `# Душа компании
1. Вася | https://example.com/vasya.jpg | 42
2. Петя
3. Коля | | 17

# Мем года
1. Маша
2. Оля
3. Игорь`;

export default function AdminArchivePage() {
  const [label, setLabel] = useState('');
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch('/api/admin/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, text }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Не удалось сохранить');
      } else {
        setDone(`Готово: «${label}» — номинаций ${data.nominations}, победителей ${data.winners}. Смотри в «Результаты» на сайте.`);
        setLabel('');
        setText('');
      }
    } catch {
      setError('Не удалось связаться с сервером');
    }
    setSaving(false);
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Архив наград</h1>
        <p className="muted">
          Внеси номинации и трёх победителей прошлого года. Один год — одна отправка. Если ошибся —
          удали архивный сезон в разделе «Сезоны» и внеси заново.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card stack">
        <input placeholder="Название сезона, например SWAG 2024" value={label} onChange={(e) => setLabel(e.target.value)} />
        <textarea
          rows={14}
          placeholder={EXAMPLE}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
        <p className="muted" style={{ fontSize: 12 }}>
          «# Название» — новая номинация. Дальше по строке на победителя (1-е, 2-е, 3-е место по порядку).
          Через «|» можно добавить ссылку на фото (https://…) и число голосов — оба необязательны.
        </p>
        <button type="submit" disabled={saving || !label.trim() || !text.trim()} style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Сохраняем…' : 'Добавить в архив'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {done && <p>{done}</p>}
    </div>
  );
}
