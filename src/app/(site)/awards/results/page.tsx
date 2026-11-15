'use client';

import { useEffect, useState } from 'react';
import ResultCard from '@/components/ResultCard';
import type { NominationResult, Season } from '@/lib/types';

type Tab = 'current' | 'past';

export default function ResultsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [tab, setTab] = useState<Tab>('current');
  const [pastId, setPastId] = useState<string>('');
  const [results, setResults] = useState<NominationResult[] | null>(null);
  const [published, setPublished] = useState(true);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [loading, setLoading] = useState(false);

  // Список сезонов берём через собственный API без кэша — удалённые/переименованные
  // сезоны сразу пропадают с сайта.
  useEffect(() => {
    async function loadSeasons() {
      try {
        const res = await fetch('/api/awards/seasons', { cache: 'no-store' });
        const data = await res.json();
        if (data.ok) {
          const list: Season[] = data.seasons;
          setSeasons(list);
          const hasCurrent = list.some((s) => s.is_current);
          const past = list.filter((s) => !s.is_current && s.results_published);
          if (!hasCurrent && past.length > 0) setTab('past');
        }
      } catch {
        // оставляем пустой список
      }
      setLoadingSeasons(false);
    }
    loadSeasons();
  }, []);

  const current = seasons.find((s) => s.is_current) ?? null;
  const past = seasons
    .filter((s) => !s.is_current && s.results_published)
    .sort((a, b) => b.label.localeCompare(a.label, 'ru', { numeric: true }));
  const activePast = past.find((s) => s.id === pastId) ?? past[0] ?? null;
  const activeSeason = tab === 'current' ? current : activePast;

  useEffect(() => {
    if (!activeSeason) {
      setResults(null);
      return;
    }
    let cancelled = false;
    async function loadResults(id: string) {
      setLoading(true);
      try {
        const res = await fetch(`/api/awards/results?seasonId=${id}`, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        setPublished(Boolean(data.published));
        setResults(data.results ?? null);
      } catch {
        if (cancelled) return;
        setPublished(false);
        setResults(null);
      }
      setLoading(false);
    }
    loadResults(activeSeason.id);
    return () => {
      cancelled = true;
    };
  }, [activeSeason?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span className="pill accent">SWAG Awards</span>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginTop: 16 }}>Результаты</h1>

        <div className="row" style={{ justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <button className={tab === 'current' ? '' : 'secondary'} onClick={() => setTab('current')}>
            Текущий сезон{current ? ` · ${current.label}` : ''}
          </button>
          <button className={tab === 'past' ? '' : 'secondary'} onClick={() => setTab('past')} disabled={past.length === 0}>
            Прошлые года
          </button>
        </div>

        {tab === 'past' && past.length > 0 && (
          <div className="row" style={{ justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            {past.map((s) => (
              <button
                key={s.id}
                className={activePast?.id === s.id ? '' : 'secondary'}
                style={{ padding: '6px 14px', fontSize: 13 }}
                onClick={() => setPastId(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loadingSeasons || loading ? (
        <p className="muted" style={{ textAlign: 'center' }}>Загружаем…</p>
      ) : !activeSeason ? (
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <p>{tab === 'current' ? 'Сейчас нет открытого сезона.' : 'Прошлых лет пока нет.'}</p>
        </div>
      ) : !published ? (
        <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <p>Результаты этого сезона ещё не объявлены — загляни позже.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {results?.map((result) => (
            <ResultCard key={result.nomination.id} result={result} />
          ))}
          {results?.length === 0 && <p className="muted">Номинаций в этом сезоне не было.</p>}
        </div>
      )}
    </main>
  );
}
