'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import ProgressBar from '@/components/ProgressBar';
import NominationCard from '@/components/NominationCard';
import type { Nomination, Nominee } from '@/lib/types';

type NominationWithNominees = Nomination & { nominees: Nominee[] };

export default function VotePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [nominations, setNominations] = useState<NominationWithNominees[]>([]);
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function init() {
      const sessionRes = await fetch('/api/awards/session');
      const sessionData = await sessionRes.json();

      if (!sessionData.hasSession) {
        router.push('/awards');
        return;
      }

      const { data: season } = await supabaseBrowser
        .from('seasons')
        .select('id')
        .eq('is_current', true)
        .maybeSingle();

      if (!season) {
        setError('Сезон голосования сейчас не открыт');
        setChecking(false);
        return;
      }

      const { data } = await supabaseBrowser
        .from('nominations')
        .select('*, nominees(*)')
        .eq('season_id', season.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      setNominations((data as NominationWithNominees[]) ?? []);
      setChecking(false);
    }
    init();
  }, [router]);

  function selectNominee(nominationId: string, nomineeId: string) {
    setSelections((prev) => ({ ...prev, [nominationId]: nomineeId }));
  }

  async function handleNext() {
    if (step < nominations.length - 1) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    setError(null);

    const votes = nominations.map((n) => ({
      nominationId: n.id,
      nomineeId: selections[n.id],
    }));

    const res = await fetch('/api/awards/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ votes }),
    });
    const data = await res.json();

    if (!data.ok) {
      setError(data.error ?? 'Не удалось сохранить голоса');
    } else {
      setDone(true);
    }
    setSubmitting(false);
  }

  if (checking) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="muted">Загружаем номинации…</p>
      </main>
    );
  }

  if (error && nominations.length === 0) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="error-text">{error}</p>
      </main>
    );
  }

  if (done) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
        }}
      >
        <p className="pill accent">Готово</p>
        <h1 style={{ fontSize: 28 }}>Спасибо за голос!</h1>
        <p className="muted">Результаты объявят после окончания голосования</p>
        <a href="/"><button className="secondary">На главную</button></a>
      </main>
    );
  }

  const current = nominations[step];
  if (!current) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="muted">Номинаций пока нет</p>
      </main>
    );
  }

  const selected = selections[current.id] ?? null;

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <ProgressBar current={step + 1} total={nominations.length} />
      </div>

      <NominationCard
        nomination={current}
        nominees={current.nominees}
        selectedId={selected}
        onSelect={(nomineeId) => selectNominee(current.id, nomineeId)}
      />

      {error && <p className="error-text">{error}</p>}

      <button onClick={handleNext} disabled={!selected || submitting} style={{ minWidth: 160 }}>
        {submitting ? 'Отправляем…' : step < nominations.length - 1 ? 'Далее' : 'Завершить'}
      </button>
    </main>
  );
}
