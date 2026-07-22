'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import ScrollReveal from '@/components/ScrollReveal';
import type { IcebergEntry } from '@/lib/types';

export default function IcebergPage() {
  const [entries, setEntries] = useState<IcebergEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [depth, setDepth] = useState(0); // 0..1 — насколько глубоко проскроллили
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser
        .from('iceberg_entries')
        .select('*')
        .eq('status', 'published')
        .order('level', { ascending: true });
      setEntries((data as IcebergEntry[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    function handleScroll() {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setDepth(total > 0 ? scrolled / total : 0);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [entries]);

  const maxLevel = Math.max(1, ...entries.map((e) => e.level));

  return (
    <main>
      <div style={{ textAlign: 'center', padding: '64px 24px 32px' }}>
        <span className="pill accent">🧊 Айсберг сервера</span>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginTop: 16 }}>
          Чем глубже, тем инсайдернее
        </h1>
        <p className="muted" style={{ marginTop: 8 }}>Листай вниз — становится темнее</p>
      </div>

      {/* Затемнение поверх фона, усиливается по мере скролла контейнера айсберга */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: `radial-gradient(circle at 50% 20%, transparent, rgba(0,0,10,${depth * 0.75}))`,
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'background 0.1s linear',
        }}
      />

      <div ref={containerRef} style={{ position: 'relative', zIndex: 2 }}>
        {loading ? (
          <p className="muted" style={{ textAlign: 'center' }}>Загружаем…</p>
        ) : entries.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center' }}>Айсберг пока пустой.</p>
        ) : (
          entries.map((entry) => {
            const entryDepth = entry.level / maxLevel;
            return (
              <section
                key={entry.id}
                style={{
                  minHeight: '50vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 24px',
                }}
              >
                <ScrollReveal>
                  <div
                    className="card"
                    style={{
                      maxWidth: 500,
                      textAlign: 'center',
                      borderColor: `color-mix(in srgb, var(--accent-1) ${entryDepth * 60}%, var(--border))`,
                    }}
                  >
                    <p className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      уровень {entry.level}
                    </p>
                    <h2 style={{ fontSize: 22, marginTop: 8 }}>{entry.title}</h2>
                    {entry.description && <p className="muted" style={{ marginTop: 8 }}>{entry.description}</p>}
                  </div>
                </ScrollReveal>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
