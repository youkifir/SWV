import { supabaseBrowser } from '@/lib/supabase/client';
import type { HistoryEvent } from '@/lib/types';

export default async function HistoryPage() {
  const { data } = await supabaseBrowser
    .from('history_events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true });

  const events = (data as HistoryEvent[]) ?? [];

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 700, margin: '0 auto' }}>
      <p className="pill accent">История сервера</p>
      <h1 style={{ fontSize: 30, marginTop: 8, marginBottom: 32 }}>Как всё начиналось</h1>

      <div className="stack" style={{ gap: 20 }}>
        {events.map((event) => (
          <div key={event.id} className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
            <p className="muted" style={{ minWidth: 90, fontSize: 13 }}>
              {new Date(event.event_date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            <div className="card" style={{ flex: 1 }}>
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt=""
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                />
              )}
              <p style={{ fontWeight: 500 }}>{event.title}</p>
              {event.description && <p className="muted" style={{ marginTop: 4 }}>{event.description}</p>}
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="muted">История пока не написана.</p>}
      </div>
    </main>
  );
}
