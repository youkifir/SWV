'use client';

import { useCallback, useEffect, useState } from 'react';
import NominationsBoard from '@/components/admin/NominationsBoard';
import SeasonToolbar from '@/components/admin/SeasonToolbar';
import { adminFetch } from '@/lib/adminFetch';
import type { Season } from '@/lib/types';

const EXAMPLE = `# Душа компании
1. Вася | https://example.com/vasya.jpg | 42
2. Петя
3. Коля | | 17

# Мем года
1. Маша
2. Оля
3. Игорь`;

export default function AdminArchivePage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [text, setText] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (selectId?: string) => {
    const data = await adminFetch('/api/admin/seasons', 'GET');
    if (data.ok) {
      const past = (data.seasons as Season[])
        .filter((s) => !s.is_current)
        .sort((a, b) => b.label.localeCompare(a.label, 'ru', { numeric: true }));
      setSeasons(past);
      setSelectedId((prev) => {
        const wanted = selectId ?? prev;
        return past.some((s) => s.id === wanted) ? wanted! : past[0]?.id ?? null;
      });
    } else {
      setError(data.error ?? 'Не удалось загрузить сезоны');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const data = await adminFetch('/api/admin/archive', 'POST', { label: label.trim(), text });
    if (!data.ok) setError(data.error ?? 'Не удалось создать');
    else {
      setLabel('');
      setText('');
      setShowBulk(false);
      await load(data.season?.id);
    }
    setCreating(false);
  }

  const selected = seasons.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Номинации — прошлые года</h1>
        <p className="muted">Выберите год, чтобы править номинации и победителей, или добавьте новый год.</p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : (
        <>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {seasons.map((s) => (
              <button
                key={s.id}
                className={s.id === selectedId ? '' : 'secondary'}
                style={{ padding: '8px 14px' }}
                onClick={() => setSelectedId(s.id)}
              >
                {s.label}
              </button>
            ))}
            {seasons.length === 0 && <p className="muted">Прошлых лет пока нет — добавьте первый ниже.</p>}
          </div>

          {selected && (
            <>
              <SeasonToolbar
                season={selected}
                onChanged={() => load()}
                onDeleted={selected.is_archive ? () => load() : undefined}
              />
              <NominationsBoard seasonId={selected.id} archive={Boolean(selected.is_archive)} />
            </>
          )}

          <form onSubmit={handleCreate} className="card stack">
            <h2 style={{ fontSize: 18 }}>Добавить прошлый год</h2>
            <input placeholder="Название, например SWAG 2024" value={label} onChange={(e) => setLabel(e.target.value)} />
            <button type="button" className="secondary" onClick={() => setShowBulk(!showBulk)} style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: 12 }}>
              {showBulk ? 'Скрыть быстрый ввод' : 'Быстрый ввод текстом (необязательно)'}
            </button>
            {showBulk && (
              <>
                <textarea rows={12} placeholder={EXAMPLE} value={text} onChange={(e) => setText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 13 }} />
                <p className="muted" style={{ fontSize: 12 }}>
                  «# Название» — номинация, затем по строке на призёра (1-е, 2-е, 3-е место). После «|» — ссылка на фото и число голосов, оба необязательны.
                </p>
              </>
            )}
            <button type="submit" disabled={creating || !label.trim()} style={{ alignSelf: 'flex-start' }}>
              {creating ? 'Создаём…' : text.trim() ? 'Создать год с номинациями' : 'Создать пустой год'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
