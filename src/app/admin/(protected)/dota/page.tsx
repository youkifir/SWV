'use client';

import { useEffect, useState } from 'react';

type DotaPlayerRow = { id: string; name: string; steam_account_id: number };

export default function AdminDotaPage() {
  const [players, setPlayers] = useState<DotaPlayerRow[]>([]);
  const [name, setName] = useState('');
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/dota');
    const data = await res.json();
    if (data.ok) setPlayers(data.players);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !steamId.trim()) return;
    setAdding(true);
    setError(null);

    const res = await fetch('/api/admin/dota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), steamAccountId: steamId.trim() }),
    });
    const data = await res.json();

    if (!data.ok) {
      setError(data.error ?? 'Не удалось добавить');
    } else {
      setName('');
      setSteamId('');
      load();
    }
    setAdding(false);
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/dota', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Ранги Dota 2</h1>
        <p className="muted">
          Ранг и статистика подтягиваются автоматически с OpenDota — ничего вручную обновлять не нужно.
          Нужен только Steam Account ID (32-bit) каждого игрока.
        </p>
        <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          Можно вставить любой формат — обычный Account ID или длинный Steam64 ID
          (начинается на 7656119...) из профиля Steam, конвертируется автоматически.
        </p>
      </div>

      <form onSubmit={handleAdd} className="card row">
        <input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
        <input
          placeholder="Steam Account ID"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={adding || !name.trim() || !steamId.trim()}>
          {adding ? 'Добавляем…' : 'Добавить'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : (
        <div className="stack">
          {players.map((player) => (
            <div key={player.id} className="card spread">
              <div className="row">
                <span style={{ fontWeight: 500 }}>{player.name}</span>
                <span className="muted">{player.steam_account_id}</span>
              </div>
              <button className="danger" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleDelete(player.id)}>
                Удалить
              </button>
            </div>
          ))}
          {players.length === 0 && <p className="muted">Игроков пока нет.</p>}
        </div>
      )}
    </div>
  );
}
