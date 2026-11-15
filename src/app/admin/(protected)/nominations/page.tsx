'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import NominationsBoard from '@/components/admin/NominationsBoard';
import SeasonToolbar from '@/components/admin/SeasonToolbar';
import { adminFetch } from '@/lib/adminFetch';
import type { Season } from '@/lib/types';

export default function AdminNominationsPage() {
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await adminFetch('/api/admin/seasons', 'GET');
    if (data.ok) setSeason((data.seasons as Season[]).find((s) => s.is_current) ?? null);
    else setError(data.error ?? 'Не удалось загрузить сезон');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Номинации — текущий сезон</h1>
        <p className="muted">
          Здесь номинации, за которые сейчас голосуют. Прошлые года — в разделе <Link href="/admin/archive" style={{ textDecoration: 'underline' }}>«Прошлые года»</Link>.
        </p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : !season ? (
        <div className="card">
          <p>Сначала откройте сезон в разделе <Link href="/admin/seasons" style={{ textDecoration: 'underline' }}>«Сезоны»</Link> — иначе некуда добавлять номинации.</p>
        </div>
      ) : (
        <>
          <SeasonToolbar season={season} onChanged={load} />
          <NominationsBoard seasonId={season.id} archive={false} />
        </>
      )}
    </div>
  );
}
