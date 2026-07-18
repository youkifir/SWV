'use client';

import { useEffect, useState } from 'react';
import NominationForm from '@/components/admin/NominationForm';
import NomineeManager from '@/components/admin/NomineeManager';
import type { Nomination, Nominee } from '@/lib/types';

type NominationWithNominees = Nomination & { nominees: Nominee[] };

export default function AdminNominationsPage() {
  const [nominations, setNominations] = useState<NominationWithNominees[]>([]);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/nominations');
    const data = await res.json();
    if (data.ok) {
      setNominations(data.nominations);
      setSeasonId(data.seasonId);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(nomination: NominationWithNominees) {
    await fetch('/api/admin/nominations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: nomination.id, isActive: !nomination.is_active }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить номинацию вместе со всеми номинантами и голосами по ней?')) return;
    await fetch('/api/admin/nominations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Номинации</h1>
        <p className="muted">Для текущего сезона. Открой номинацию, чтобы добавить номинантов.</p>
      </div>

      {!loading && !seasonId && (
        <div className="card">
          <p>Сначала нужно открыть сезон — иначе некуда добавлять номинации.</p>
        </div>
      )}

      {seasonId && <NominationForm seasonId={seasonId} onCreated={load} />}

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : (
        <div className="stack">
          {nominations.map((nomination) => (
            <div key={nomination.id} className="card">
              <div className="spread">
                <div
                  className="row"
                  style={{ cursor: 'pointer', flex: 1 }}
                  onClick={() => setExpanded(expanded === nomination.id ? null : nomination.id)}
                >
                  {nomination.cover_image_url && (
                    <img
                      src={nomination.cover_image_url}
                      alt=""
                      style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <p style={{ fontWeight: 500 }}>{nomination.title}</p>
                    <p className="muted">{nomination.nominees?.length ?? 0} номинантов</p>
                  </div>
                </div>

                <div className="row">
                  {!nomination.is_active && <span className="pill">скрыта</span>}
                  <button className="secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => toggleActive(nomination)}>
                    {nomination.is_active ? 'Скрыть' : 'Показать'}
                  </button>
                  <button className="danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleDelete(nomination.id)}>
                    Удалить
                  </button>
                </div>
              </div>

              {expanded === nomination.id && (
                <NomineeManager nominationId={nomination.id} nominees={nomination.nominees ?? []} onChange={load} />
              )}
            </div>
          ))}
          {nominations.length === 0 && seasonId && (
            <p className="muted">Номинаций пока нет — добавь первую выше.</p>
          )}
        </div>
      )}
    </div>
  );
}
