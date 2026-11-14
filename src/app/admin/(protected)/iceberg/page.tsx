'use client';

import { useEffect, useState } from 'react';
import type { IcebergEntry } from '@/lib/types';

export default function AdminIcebergPage() {
  const [entries, setEntries] = useState<IcebergEntry[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/iceberg');
      const data = await res.json();
      if (data.ok) setEntries(data.entries);
      else setError(data.error ?? 'Не удалось загрузить');
    } catch {
      setError('Не удалось связаться с сервером');
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/iceberg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!data.ok) setError(data.error ?? 'Не удалось сохранить');
      else {
        setText('');
        await load();
      }
    } catch {
      setError('Не удалось связаться с сервером');
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/admin/iceberg', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json().catch(() => null);
    if (!data?.ok) setError(data?.error ?? 'Не удалось удалить');
    await load();
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Айсберг</h1>
        <p className="muted">Уровень 1 — всем известное (верхушка), чем больше число — тем глубже и инсайдернее.</p>
      </div>

      <form onSubmit={handleAdd} className="card stack">
        <textarea
          rows={8}
          placeholder={'1 | Название сервера | необязательное описание\n2 | Старый мем | откуда он взялся\n5 | Тот самый случай'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
        <p className="muted" style={{ fontSize: 12 }}>Каждая строка: уровень | заголовок | описание. Можно добавлять сразу пачкой.</p>
        <button type="submit" disabled={saving || !text.trim()} style={{ alignSelf: 'flex-start' }}>
          {saving ? 'Сохраняем…' : 'Добавить'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : (
        <div className="stack">
          {entries.map((entry) => (
            <div key={entry.id} className="card spread">
              <div>
                <p style={{ fontWeight: 500 }}>
                  <span className="pill">ур. {entry.level}</span> {entry.title}
                </p>
                {entry.description && <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{entry.description}</p>}
              </div>
              <button className="danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(entry.id)}>
                Удалить
              </button>
            </div>
          ))}
          {entries.length === 0 && <p className="muted">Записей пока нет.</p>}
        </div>
      )}
    </div>
  );
}
