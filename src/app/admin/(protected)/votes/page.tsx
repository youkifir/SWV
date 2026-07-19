'use client';

import { useEffect, useState } from 'react';
import type { VoterBreakdownEntry } from '@/lib/results';

export default function AdminVotesPage() {
  const [breakdown, setBreakdown] = useState<VoterBreakdownEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/votes');
      const data = await res.json();
      if (data.ok) setBreakdown(data.breakdown);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = breakdown.filter((entry) =>
    (entry.label ?? entry.code).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28 }}>Кто как голосовал</h1>
        <p className="muted">
          Раскрывает анонимность — видно только тебе. Работает только для кодов, у которых
          при генерации была указана метка/имя (раздел «Коды» → «По именам»).
        </p>
      </div>

      <input
        placeholder="Поиск по имени или коду"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p className="muted">Загружаем…</p>
      ) : (
        <div className="stack">
          {filtered.map((entry) => (
            <div key={entry.codeId} className="card stack">
              <div className="spread">
                <div className="row">
                  <span style={{ fontWeight: 500 }}>{entry.label ?? 'без имени'}</span>
                  <code className="muted">{entry.code}</code>
                </div>
                <span className={`pill ${entry.isUsed ? 'accent' : ''}`}>
                  {entry.isUsed ? 'проголосовал' : 'ещё не голосовал'}
                </span>
              </div>

              {entry.choices.length > 0 ? (
                <div className="stack" style={{ gap: 4 }}>
                  {entry.choices.map((choice, i) => (
                    <div key={i} className="spread muted" style={{ fontSize: 13 }}>
                      <span>{choice.nominationTitle}</span>
                      <span>→ {choice.nomineeName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 13 }}>Голосов нет</p>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="muted">Ничего не найдено.</p>}
        </div>
      )}
    </div>
  );
}
