'use client';

import { useState } from 'react';
import ImagePicker from './ImagePicker';
import { adminFetch } from '@/lib/adminFetch';
import type { Nominee } from '@/lib/types';

type Props = {
  nominationId: string;
  nominees: Nominee[];
  archive: boolean; // архивный сезон: у номинанта есть место 1-3 и (необязательно) число голосов
  onChange: () => void;
};

const PLACES = [
  { value: '', label: 'без места' },
  { value: '1', label: '🥇 1 место' },
  { value: '2', label: '🥈 2 место' },
  { value: '3', label: '🥉 3 место' },
];

function placeBadge(place?: number | null) {
  return place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : '';
}

export default function NomineeManager({ nominationId, nominees, archive, onChange }: Props) {
  const sorted = [...nominees].sort((a, b) =>
    archive ? (a.place ?? 99) - (b.place ?? 99) || a.sort_order - b.sort_order : a.sort_order - b.sort_order
  );
  const freePlace = [1, 2, 3].find((p) => !nominees.some((n) => n.place === p));

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [place, setPlace] = useState<string>(archive && freePlace ? String(freePlace) : '');
  const [votes, setVotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [eName, setEName] = useState('');
  const [eAvatar, setEAvatar] = useState<string | null>(null);
  const [ePlace, setEPlace] = useState('');
  const [eVotes, setEVotes] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const data = await adminFetch('/api/admin/nominees', 'POST', {
      nominationId,
      name: name.trim(),
      avatarUrl,
      ...(archive ? { place: place || null, archiveVotes: votes || null } : {}),
    });
    if (!data.ok) setError(data.error ?? 'Не удалось добавить');
    else {
      setName('');
      setAvatarUrl(null);
      setVotes('');
      setPlace('');
      onChange();
    }
    setBusy(false);
  }

  function startEdit(n: Nominee) {
    setEditId(n.id);
    setEName(n.name);
    setEAvatar(n.avatar_url);
    setEPlace(n.place ? String(n.place) : '');
    setEVotes(n.archive_votes != null ? String(n.archive_votes) : '');
    setError(null);
  }

  async function saveEdit(id: string) {
    setBusy(true);
    setError(null);
    const data = await adminFetch('/api/admin/nominees', 'PATCH', {
      id,
      name: eName,
      avatarUrl: eAvatar,
      ...(archive ? { place: ePlace || null, archiveVotes: eVotes || null } : {}),
    });
    if (!data.ok) setError(data.error ?? 'Не удалось сохранить');
    else {
      setEditId(null);
      onChange();
    }
    setBusy(false);
  }

  async function handleDelete(n: Nominee) {
    if (!confirm(`Удалить «${n.name}»?`)) return;
    const data = await adminFetch('/api/admin/nominees', 'DELETE', { id: n.id });
    if (!data.ok) setError(data.error ?? 'Не удалось удалить');
    onChange();
  }

  return (
    <div className="stack" style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
      {sorted.map((n) =>
        editId === n.id ? (
          <div key={n.id} className="card stack" style={{ gap: 8 }}>
            <input value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Имя / ник" />
            <ImagePicker label="Фото" value={eAvatar} onChange={setEAvatar} />
            {archive && (
              <div className="row">
                <select value={ePlace} onChange={(e) => setEPlace(e.target.value)}>
                  {PLACES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <input type="number" min={0} placeholder="Голоса (необязательно)" value={eVotes} onChange={(e) => setEVotes(e.target.value)} />
              </div>
            )}
            <div className="row">
              <button disabled={busy || !eName.trim()} onClick={() => saveEdit(n.id)} style={{ padding: '8px 14px' }}>Сохранить</button>
              <button className="secondary" onClick={() => setEditId(null)} style={{ padding: '8px 14px' }}>Отмена</button>
            </div>
          </div>
        ) : (
          <div key={n.id} className="spread" style={{ gap: 8 }}>
            <div className="row" style={{ minWidth: 0 }}>
              {n.avatar_url && <img src={n.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />}
              <span style={{ overflowWrap: 'anywhere' }}>
                {archive && placeBadge(n.place) && <span>{placeBadge(n.place)} </span>}
                {n.name}
                {archive && n.archive_votes != null && <span className="muted"> · {n.archive_votes} гол.</span>}
              </span>
            </div>
            <div className="row" style={{ flexShrink: 0 }}>
              <button className="secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => startEdit(n)}>Изменить</button>
              <button className="danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(n)}>Удалить</button>
            </div>
          </div>
        )
      )}
      {sorted.length === 0 && <p className="muted">Номинантов пока нет.</p>}

      <form onSubmit={handleAdd} className="stack" style={{ gap: 8, marginTop: 8 }}>
        <div className="row">
          <input placeholder={archive ? 'Победитель / призёр' : 'Имя номинанта'} value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
          {archive && (
            <select value={place} onChange={(e) => setPlace(e.target.value)}>
              {PLACES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          )}
        </div>
        {archive && (
          <input type="number" min={0} placeholder="Голоса (необязательно)" value={votes} onChange={(e) => setVotes(e.target.value)} />
        )}
        <ImagePicker label="Фото (необязательно)" value={avatarUrl} onChange={setAvatarUrl} />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={busy || !name.trim()} style={{ alignSelf: 'flex-start', padding: '10px 14px' }}>
          {busy ? 'Сохраняем…' : 'Добавить'}
        </button>
      </form>
    </div>
  );
}
