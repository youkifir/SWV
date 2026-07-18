import { supabaseBrowser } from '@/lib/supabase/client';
import type { IcebergEntry } from '@/lib/types';

export default async function IcebergPage() {
  const { data } = await supabaseBrowser
    .from('iceberg_entries')
    .select('*')
    .eq('status', 'published')
    .order('level', { ascending: true });

  const entries = (data as IcebergEntry[]) ?? [];
  const maxLevel = Math.max(1, ...entries.map((e) => e.level));

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 700, margin: '0 auto' }}>
      <p className="pill accent">Айсберг сервера</p>
      <h1 style={{ fontSize: 30, marginTop: 8, marginBottom: 32 }}>Чем глубже, тем инсайдернее</h1>

      <div className="stack" style={{ gap: 0 }}>
        {entries.map((entry) => {
          const depth = entry.level / maxLevel;
          const bg = `rgba(30, 60, 90, ${0.15 + depth * 0.5})`;
          return (
            <div
              key={entry.id}
              style={{
                padding: '20px 24px',
                background: bg,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <p className="muted" style={{ fontSize: 12 }}>уровень {entry.level}</p>
              <p style={{ fontWeight: 500, marginTop: 4 }}>{entry.title}</p>
              {entry.description && <p className="muted" style={{ marginTop: 4 }}>{entry.description}</p>}
            </div>
          );
        })}
        {entries.length === 0 && <p className="muted">Айсберг пока пустой.</p>}
      </div>
    </main>
  );
}
