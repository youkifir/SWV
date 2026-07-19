'use client';

import { useEffect, useState } from 'react';
import type { NominationResult, Season } from '@/lib/types';

export default function AdminResultsPage() {
  const [season, setSeason] = useState<Season | null>(null);
  const [results, setResults] = useState<NominationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  async function load() {
    setLoading(true);
    const [seasonsRes, resultsRes] = await Promise.all([
      fetch('/api/admin/seasons'),
      fetch('/api/admin/results'),
    ]);
    const seasonsData = await seasonsRes.json();
    const resultsData = await resultsRes.json();

    const current = seasonsData.seasons?.find((s: Season) => s.is_current) ?? null;
    setSeason(current);
    setResults(resultsData.results ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublish() {
    if (!season) return;
    setToggling(true);
    await fetch('/api/admin/results', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seasonId: season.id, published: !season.results_published }),
    });
    await load();
    setToggling(false);
  }

  if (loading) {
    return <p className="muted">Загружаем…</p>;
  }

  if (!season) {
    return (
      <div className="card">
        <p>Сначала нужно открыть сезон в разделе «Сезоны».</p>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="spread">
        <div>
          <p className="pill accent">{season.label}</p>
          <h1 style={{ fontSize: 28, marginTop: 8 }}>Результаты</h1>
        </div>
        <button onClick={togglePublish} disabled={toggling}>
          {season.results_published ? 'Скрыть результаты' : 'Опубликовать результаты'}
        </button>
      </div>

      <p className="muted">
        {season.results_published
          ? 'Результаты видны всем на публичной странице /awards/results (топ-3 по каждой номинации).'
          : 'Пока скрыто — участники видят заглушку «результаты объявят после ивента». Здесь, в админке, ты уже видишь полную раскладку голосов по всем кандидатам.'}
      </p>

      <div className="stack">
        {results.map((result) => (
          <div key={result.nomination.id} className="card stack">
            <h2 style={{ fontSize: 18 }}>{result.nomination.title}</h2>
            <div className="stack" style={{ gap: 6 }}>
              {result.standings.map((entry, i) => (
                <div key={entry.nominee.id} className="spread" style={{ fontSize: 14 }}>
                  <span>{i === 0 ? '🏆 ' : `${i + 1}. `}{entry.nominee.name}</span>
                  <span className="muted">{entry.voteCount} голосов</span>
                </div>
              ))}
              {result.standings.length === 0 && <p className="muted">Номинантов нет</p>}
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="muted">Номинаций в этом сезоне пока нет.</p>}
      </div>
    </div>
  );
}
