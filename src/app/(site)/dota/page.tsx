'use client';

import { useEffect, useState } from 'react';
import type { DotaPlayerStats } from '@/lib/dota';

function StarDots({ count }: { count: number }) {
  return (
    <span style={{ letterSpacing: 1 }}>
      {'★'.repeat(count)}
      <span style={{ opacity: 0.25 }}>{'★'.repeat(Math.max(0, 5 - count))}</span>
    </span>
  );
}

export default function DotaPage() {
  const [players, setPlayers] = useState<DotaPlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/dota');
      const data = await res.json();
      if (data.ok) setPlayers(data.players);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span className="pill accent">🎮 Dota 2</span>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(28px, 6vw, 40px)', marginTop: 16 }}>
          Ранги сервера
        </h1>
        <p className="muted" style={{ marginTop: 8 }}>Обновляется автоматически из статистики OpenDota</p>
      </div>

      {loading ? (
        <p className="muted" style={{ textAlign: 'center' }}>Загружаем…</p>
      ) : (
        <div className="stack">
          {players.map((player, i) => (
            <div key={player.id} className="card spread">
              <div className="row">
                <span className="muted" style={{ width: 24, textAlign: 'center', fontWeight: 600 }}>{i + 1}</span>
                {player.avatarUrl && (
                  <img
                    src={player.avatarUrl}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <p style={{ fontWeight: 600 }}>{player.name}</p>
                  {player.personaName && <p className="muted" style={{ fontSize: 12 }}>{player.personaName}</p>}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {player.medal ? (
                  <>
                    <p style={{ fontWeight: 600 }}>{player.medal}</p>
                    {player.isImmortal ? (
                      <p className="muted" style={{ fontSize: 12 }}>
                        {player.leaderboardRank ? `#${player.leaderboardRank} в топе` : 'ранг скрыт'}
                      </p>
                    ) : (
                      <p className="muted" style={{ fontSize: 12 }}><StarDots count={player.stars} /></p>
                    )}
                  </>
                ) : (
                  <p className="muted">Ранг не виден (скрыт в настройках Steam/Dota)</p>
                )}
              </div>
            </div>
          ))}
          {players.length === 0 && <p className="muted" style={{ textAlign: 'center' }}>Список игроков пока пуст.</p>}
        </div>
      )}
    </main>
  );
}
