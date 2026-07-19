import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Meme } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function MemesPage() {
  const { data } = await supabaseBrowser
    .from('memes')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const memes = (data as Meme[]) ?? [];

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div className="spread" style={{ marginBottom: 24 }}>
        <div>
          <p className="pill accent">Мемы</p>
          <h1 style={{ fontSize: 30, marginTop: 8 }}>Локальная классика</h1>
        </div>
        <Link href="/memes/submit"><button className="secondary">Добавить мем</button></Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {memes.map((meme) => (
          <div key={meme.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <img src={meme.image_url} alt="" style={{ width: '100%', display: 'block' }} />
            {meme.caption && <p style={{ padding: 12, fontSize: 14 }}>{meme.caption}</p>}
          </div>
        ))}
        {memes.length === 0 && <p className="muted">Мемов пока нет.</p>}
      </div>
    </main>
  );
}
