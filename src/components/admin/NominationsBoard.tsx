'use client';

import { useCallback, useEffect, useState } from 'react';
import NominationForm from './NominationForm';
import NomineeManager from './NomineeManager';
import ImagePicker from './ImagePicker';
import { adminFetch } from '@/lib/adminFetch';
import type { Nomination, Nominee } from '@/lib/types';

type NominationWithNominees = Nomination & { nominees: Nominee[] };

type Props = {
  seasonId: string;
  archive: boolean; // архив: у номинантов задаются места 1-3
};

// Общий редактор номинаций сезона: используется и для текущего сезона, и для прошлых лет.
export default function NominationsBoard({ seasonId, archive }: Props) {
  const [items, setItems] = useState<NominationWithNominees[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eCover, setECover] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await adminFetch(`/api/admin/nominations?seasonId=${seasonId}`, 'GET');
    if (data.ok) {
      const list = [...(data.nominations as NominationWithNominees[])].sort((a, b) => a.sort_order - b.sort_order);
      setItems(list);
      setError(null);
    } else {
      setError(data.error ?? 'Не удалось загрузить номинации');
    }
    setLoading(false);
  }, [seasonId]);

  useEffect(() => {
    setLoading(true);
    setExpanded(null);
    setEditId(null);
    load();
  }, [load]);

  function startEdit(n: NominationWithNominees) {
    setEditId(n.id);
    setETitle(n.title);
    setEDesc(n.description ?? '');
    setECover(n.cover_image_url);
    setError(null);
  }

  async function saveEdit(id: string) {
    setSaving(true);
    const data = await adminFetch('/api/admin/nominations', 'PATCH', {
      id,
      title: eTitle,
      description: eDesc.trim() || null,
      coverImageUrl: eCover,
    });
    if (!data.ok) setError(data.error ?? 'Не удалось сохранить');
    else {
      setEditId(null);
      await load();
    }
    setSaving(false);
  }

  async function toggleActive(n: NominationWithNominees) {
    const data = await adminFetch('/api/admin/nominations', 'PATCH', { id: n.id, isActive: !n.is_active });
    if (!data.ok) setError(data.error ?? 'Не удалось изменить');
    await load();
  }

  async function handleDelete(n: NominationWithNominees) {
    if (!confirm(`Удалить номинацию «${n.title}» вместе со всеми номинантами${archive ? '' : ' и голосами по ней'}?`)) return;
    const data = await adminFetch('/api/admin/nominations', 'DELETE', { id: n.id });
    if (!data.ok) setError(data.error ?? 'Не удалось удалить');
    await load();
  }

  // Меняем порядок: переписываем sort_order у всех номинаций по новой расстановке
  async function move(index: number, delta: -1 | 1) {
    const j = index + delta;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    const results = await Promise.all(
      next.map((n, i) => (n.sort_order === i ? null : adminFetch('/api/admin/nominations', 'PATCH', { id: n.id, sortOrder: i })))
    );
    if (results.some((r) => r && !r.ok)) setError('Не удалось сохранить порядок');
    await load();
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <NominationForm seasonId={seasonId} onCreated={load} />
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : (
        <div className="stack">
          {items.map((n, index) =>
            editId === n.id ? (
              <div key={n.id} className="card stack">
                <h2 style={{ fontSize: 16 }}>Редактирование номинации</h2>
                <input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="Название" />
                <textarea rows={2} value={eDesc} onChange={(e) => setEDesc(e.target.value)} placeholder="Описание (необязательно)" />
                <ImagePicker label="Обложка (необязательно)" value={eCover} onChange={setECover} />
                <div className="row">
                  <button disabled={saving || !eTitle.trim()} onClick={() => saveEdit(n.id)}>Сохранить</button>
                  <button className="secondary" onClick={() => setEditId(null)}>Отмена</button>
                </div>
              </div>
            ) : (
              <div key={n.id} className="card">
                <div className="spread" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <div className="row" style={{ cursor: 'pointer', flex: 1, minWidth: 200 }} onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
                    {n.cover_image_url && <img src={n.cover_image_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{n.title}</p>
                      <p className="muted">{n.nominees?.length ?? 0} {archive ? 'призёров' : 'номинантов'}</p>
                    </div>
                  </div>
                  <div className="row" style={{ flexWrap: 'wrap' }}>
                    {!n.is_active && <span className="pill">скрыта</span>}
                    <button className="secondary" disabled={index === 0} style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => move(index, -1)} aria-label="Выше">↑</button>
                    <button className="secondary" disabled={index === items.length - 1} style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => move(index, 1)} aria-label="Ниже">↓</button>
                    <button className="secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => startEdit(n)}>Изменить</button>
                    <button className="secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => toggleActive(n)}>{n.is_active ? 'Скрыть' : 'Показать'}</button>
                    <button className="danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleDelete(n)}>Удалить</button>
                  </div>
                </div>

                {expanded === n.id && (
                  <NomineeManager nominationId={n.id} nominees={n.nominees ?? []} archive={archive} onChange={load} />
                )}
              </div>
            )
          )}
          {items.length === 0 && <p className="muted">Номинаций пока нет — добавьте первую выше.</p>}
        </div>
      )}
    </div>
  );
}
