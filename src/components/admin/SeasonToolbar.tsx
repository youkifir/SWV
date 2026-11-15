'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';
import type { Season } from '@/lib/types';

type Props = {
  season: Season;
  onChanged: () => void;
  onDeleted?: () => void; // передаётся только для архивных сезонов
};

// Название сезона: переименование, показ результатов на сайте, удаление (только архив).
export default function SeasonToolbar({ season, onChanged, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(season.label);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const data = await adminFetch('/api/admin/seasons', 'PATCH', { id: season.id, ...body });
    if (!data.ok) setError(data.error ?? 'Не удалось сохранить');
    else {
      setEditing(false);
      onChanged();
    }
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm(`Удалить сезон «${season.label}» вместе со всеми номинациями и победителями?`)) return;
    setBusy(true);
    const data = await adminFetch('/api/admin/seasons', 'DELETE', { id: season.id });
    if (!data.ok) setError(data.error ?? 'Не удалось удалить');
    else onDeleted?.();
    setBusy(false);
  }

  return (
    <div className="card stack" style={{ gap: 10 }}>
      {editing ? (
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <input value={label} onChange={(e) => setLabel(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
          <button disabled={busy || !label.trim()} onClick={() => patch({ label })}>Сохранить</button>
          <button className="secondary" onClick={() => { setEditing(false); setLabel(season.label); }}>Отмена</button>
        </div>
      ) : (
        <div className="spread" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="row">
            <h2 style={{ fontSize: 20 }}>{season.label}</h2>
            {season.is_current && <span className="pill accent">текущий</span>}
            {season.is_archive && <span className="pill">архив</span>}
          </div>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            <button className="secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setEditing(true)}>Переименовать</button>
            {!season.is_current && (
              <button className="secondary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busy} onClick={() => patch({ resultsPublished: !season.results_published })}>
                {season.results_published ? 'Скрыть с сайта' : 'Показать на сайте'}
              </button>
            )}
            {onDeleted && (
              <button className="danger" style={{ padding: '6px 12px', fontSize: 12 }} disabled={busy} onClick={handleDelete}>Удалить сезон</button>
            )}
          </div>
        </div>
      )}
      {!season.is_current && !season.results_published && (
        <p className="muted" style={{ fontSize: 12 }}>Сезон сейчас скрыт: на странице результатов его не видно.</p>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
