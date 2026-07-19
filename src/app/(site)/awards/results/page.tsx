'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import ResultCard from '@/components/ResultCard';
import type { NominationResult, Season } from '@/lib/types';

export default function ResultsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonId, setSeasonId] = useState<string>('');
  const [results, setResults] = useState<NominationResult[] | null>(null);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeasons() {
      const { data } = await supabaseBrowser
        .from('seasons')
        .select('*')
        .order('created_at', { ascending: false });
      setSeasons(data ?? []);
      const current = data?.find((s) => s.is_current) ?? data?.[0];
      if (current) setSeasonId(current.id);
      else setLoading(false);
    }
    loadSeasons();
  }, []);

  useEffect(() => {
    if (!seasonId) return;
    async function loadResults() {
      setLoading(true);
      const res = await fetch(`/api/awards/results?seasonId=${seasonId}`);
      const data = await res.json();
      setPublished(Boolean(data.published));
      setResults(data.results ?? null);
      setLoading(false);
    }
    loadResults();
  }, [seasonId]);

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span className="pill accent">SWAG Awards</span>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginTop: 16 }}>Результаты</h1>
        {seasons.length > 0 && (
          <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)} style={{ marginTop: 16 }}>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className="muted" style={{ textAlign: 'center' }}>Загружаем…</p>
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
