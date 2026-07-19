import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Member } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function GlossaryPage() {
  const { data } = await supabaseBrowser
    .from('members')
    .select('*')
    .eq('status', 'published')
    .order('name', { ascending: true });

  const members = (data as Member[]) ?? [];

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 800, margin: '0 auto' }}>
      <div className="spread" style={{ marginBottom: 24 }}>
        <div>
          <p className="pill accent">Глоссарий</p>
          <h1 style={{ fontSize: 30, marginTop: 8 }}>Кто есть кто</h1>
        </div>
        <Link href="/glossary/submit"><button className="secondary">Предложить</button></Link>
      </div>

      <div className="stack">
        {members.map((member) => (
          <div key={member.id} className="card row">
            {member.avatar_url && (
              <img
                src={member.avatar_url}
                alt=""
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <div>
              <p style={{ fontWeight: 500 }}>{member.name}</p>
              {member.description && <p className="muted">{member.description}</p>}
            </div>
          </div>
        ))}
        {members.length === 0 && <p className="muted">Пока пусто — стань первым в глоссарии.</p>}
      </div>
    </main>
  );
}
