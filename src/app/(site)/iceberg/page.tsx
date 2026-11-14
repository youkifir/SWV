'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import ScrollReveal from '@/components/ScrollReveal';
import type { IcebergEntry } from '@/lib/types';

// Нарисованный айсберг: верхушка над водой + большая подводная часть,
// на которой по уровням (от поверхностного к самому глубокому) лежат записи.
// Подводная часть — SVG, который растягивается под любую высоту контента.

function Tip() {
  return (
    <svg viewBox="0 0 600 240" style={{ width: 'min(560px, 92%)', display: 'block', margin: '0 auto' }} role="img" aria-label="Верхушка айсберга">
      <defs>
        <linearGradient id="tipA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#bfe3f7" />
        </linearGradient>
      </defs>
      <polygon points="30,240 140,150 205,172 292,38 352,112 402,82 478,160 570,240" fill="url(#tipA)" />
      <polygon points="292,38 352,112 318,150 270,118" fill="#ffffff" opacity="0.55" />
      <polygon points="140,150 205,172 175,240 90,240" fill="#9fcdea" opacity="0.5" />
      <polygon points="402,82 478,160 440,240 390,240 420,150" fill="#8fc3e4" opacity="0.45" />
    </svg>
  );
}

function levelTitle(level: number, isFirst: boolean) {
  return isFirst ? `Уровень ${level} · верхушка` : `Уровень ${level}`;
}

export default function IcebergPage() {
  const [entries, setEntries] = useState<IcebergEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabaseBrowser
        .from('iceberg_entries')
        .select('*')
        .eq('status', 'published')
        .order('level', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) setFailed(true);
      setEntries((data as IcebergEntry[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const levels = Array.from(new Set<number>(entries.map((e) => e.level))).sort((a, b) => a - b);

  return (
    <main>
      <div style={{ textAlign: 'center', padding: '56px 24px 24px' }}>
        <span className="pill accent">🧊 Айсберг сервера</span>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginTop: 16 }}>
          Чем глубже, тем инсайдернее
        </h1>
        <p className="muted" style={{ marginTop: 8 }}>Листай вниз — уходим под воду</p>
      </div>

      {/* Небо + верхушка */}
      <div style={{ background: 'linear-gradient(#6fc0ee, #d6f0ff)', paddingTop: 40 }}>
        <Tip />
      </div>

      {/* Вода + подводная часть */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(#0d6aa3 0%, #07345f 45%, #020b1c 100%)',
          minHeight: 520,
          padding: '0 0 120px',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="-10 0 640 1000"
          preserveAspectRatio="none"
          aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="bodyA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d9f2ff" />
              <stop offset="35%" stopColor="#7fbbe6" />
              <stop offset="100%" stopColor="#1d4f8f" />
            </linearGradient>
          </defs>
          <polygon
            points="30,0 570,0 610,150 575,330 625,520 545,720 590,900 430,1000 200,985 55,885 20,700 75,520 -5,340 35,160"
            fill="url(#bodyA)"
            opacity="0.92"
          />
          <polygon points="30,0 300,0 260,200 330,420 240,640 300,860 200,985 55,885 20,700 75,520 -5,340 35,160" fill="#ffffff" opacity="0.12" />
        </svg>

        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', padding: '48px 20px 0' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#eaf6ff' }}>Загружаем…</p>
          ) : failed ? (
            <p style={{ textAlign: 'center', color: '#eaf6ff' }}>Не удалось загрузить записи айсберга.</p>
          ) : entries.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#eaf6ff' }}>Айсберг пока пустой — записи скоро появятся.</p>
          ) : (
            levels.map((level, idx) => (
              <ScrollReveal key={level}>
                <section style={{ marginBottom: 56 }}>
                  <p
                    style={{
                      textAlign: 'center',
                      color: '#eaf6ff',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      marginBottom: 14,
                      textShadow: '0 1px 6px rgba(0,10,30,.7)',
                    }}
                  >
                    {levelTitle(level, idx === 0)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {entries
                      .filter((e) => e.level === level)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          style={{
                            background: 'rgba(4, 18, 40, 0.62)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 14,
                            padding: '14px 18px',
                            color: '#eaf6ff',
                            textAlign: 'center',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          <h2 style={{ fontSize: 18 }}>{entry.title}</h2>
                          {entry.description && (
                            <p style={{ marginTop: 6, fontSize: 14, opacity: 0.8 }}>{entry.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </section>
              </ScrollReveal>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
