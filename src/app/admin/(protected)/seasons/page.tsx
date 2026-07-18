'use client';

import { useEffect, useState } from 'react';
import type { Season } from '@/lib/types';

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/seasons');
    const data = await res.json();
    if (data.ok) setSeasons(data.seasons);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setCreating(true);
    setError(null);

    const res = await fetch('/api/admin/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    const data = await res.json();

    if (!data.ok) {
      setError(data.error ?? 'Не удалось создать сезон');
    } else {
      setNewLabel('');
      await load();
    }
    setCreating(false);
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Сезоны</h1>
        <p className="muted">
          Каждый год SWAG Awards — отдельный сезон со своими номинациями и кодами.
          Открытие нового сезона не удаляет старый — прошлые остаются архивом.
        </p>
      </div>

      <form onSubmit={handleCreate} className="card row">
        <input
          placeholder="Например, SWAG 2027"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={creating || !newLabel.trim()}>
          {creating ? 'Создаём…' : 'Открыть новый сезон'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : (
        <div className="stack">
          {seasons.map((season) => (
            <div key={season.id} className="card spread">
              <div className="row">
                <p style={{ fontWeight: 500 }}>{season.label}</p>
                {season.is_current && <span className="pill accent">текущий</span>}
                {season.results_published && <span className="pill">результаты опубликованы</span>}
              </div>
            </div>
          ))}
          {seasons.length === 0 && <p className="muted">Сезонов пока нет — создайте первый выше.</p>}
        </div>
      )}
    </div>
  );
}
