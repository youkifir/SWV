import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import StatsCard from '@/components/admin/StatsCard';

export default async function AdminDashboardPage() {
  const supabase = createServerClient();

  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_current', true)
    .maybeSingle();

  let nominationsCount = 0;
  let codesTotal = 0;
  let codesUsed = 0;
  let pendingSubmissions = 0;

  if (season) {
    const [{ count: nomCount }, { count: codesCount }, { count: usedCount }] = await Promise.all([
      supabase.from('nominations').select('*', { count: 'exact', head: true }).eq('season_id', season.id),
      supabase.from('voter_codes').select('*', { count: 'exact', head: true }).eq('season_id', season.id),
      supabase
        .from('voter_codes')
        .select('*', { count: 'exact', head: true })
        .eq('season_id', season.id)
        .eq('is_used', true),
    ]);
    nominationsCount = nomCount ?? 0;
    codesTotal = codesCount ?? 0;
    codesUsed = usedCount ?? 0;
  }

  const { count: pendingCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  pendingSubmissions = pendingCount ?? 0;

  return (
    <div className="stack" style={{ gap: 28 }}>
      <div>
        <p className="pill accent">{season ? season.label : 'Сезон не создан'}</p>
        <h1 style={{ fontSize: 30, marginTop: 8 }}>Дашборд</h1>
      </div>

      {!season && (
        <div className="card">
          <p>Ещё нет ни одного сезона SWAG Awards.</p>
          <Link href="/admin/seasons">
            <button style={{ marginTop: 12 }}>Создать первый сезон</button>
          </Link>
        </div>
      )}

      {season && (
        <div className="row" style={{ gap: 16 }}>
          <StatsCard label="Номинаций" value={nominationsCount} />
          <StatsCard label="Проголосовало" value={`${codesUsed} / ${codesTotal}`} />
          <StatsCard label="Заявок на модерации" value={pendingSubmissions} />
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Быстрые действия</h2>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <Link href="/admin/nominations"><button className="secondary">Номинации и номинанты</button></Link>
          <Link href="/admin/codes"><button className="secondary">Коды голосующих</button></Link>
          <Link href="/admin/submissions"><button className="secondary">Очередь заявок ({pendingSubmissions})</button></Link>
          <Link href="/admin/seasons"><button className="secondary">Управление сезонами</button></Link>
        </div>
      </div>
    </div>
  );
}
