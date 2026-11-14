import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { parseArchiveText } from '@/lib/archive';

// POST { label: string, text: string } — создаёт архивный сезон (не текущий,
// результаты сразу опубликованы) с номинациями и победителями (места 1-3).
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const label = typeof body?.label === 'string' ? body.label.trim() : '';
  const text = typeof body?.text === 'string' ? body.text : '';

  if (!label || label.length > 80) {
    return NextResponse.json({ ok: false, error: 'Укажите название сезона (до 80 символов)' }, { status: 400 });
  }
  if (text.length > 20000) {
    return NextResponse.json({ ok: false, error: 'Текст слишком длинный' }, { status: 400 });
  }

  const parsed = parseArchiveText(text);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: season, error: seasonError } = await supabase
    .from('seasons')
    .insert({ label, is_current: false, is_archive: true, results_published: true })
    .select()
    .single();
  if (seasonError || !season) {
    console.error('archive season insert error:', seasonError);
    return NextResponse.json({ ok: false, error: 'Не удалось создать сезон' }, { status: 500 });
  }

  const rollback = async () => {
    await supabase.from('seasons').delete().eq('id', season.id); // каскадом удалит номинации и номинантов
  };

  const { data: nominations, error: nomError } = await supabase
    .from('nominations')
    .insert(
      parsed.nominations.map((n, i) => ({ season_id: season.id, title: n.title, sort_order: i, is_active: true }))
    )
    .select('id, sort_order');
  if (nomError || !nominations) {
    console.error('archive nominations insert error:', nomError);
    await rollback();
    return NextResponse.json({ ok: false, error: 'Не удалось создать номинации' }, { status: 500 });
  }

  const idByOrder = new Map<number, string>(nominations.map((n) => [n.sort_order as number, n.id as string]));
  const nominees = parsed.nominations.flatMap((n, i) =>
    n.winners.map((w, place) => ({
      nomination_id: idByOrder.get(i)!,
      name: w.name,
      avatar_url: w.avatarUrl,
      sort_order: place,
      place: place + 1,
      archive_votes: w.votes,
    }))
  );

  const { error: nomineeError } = await supabase.from('nominees').insert(nominees);
  if (nomineeError) {
    console.error('archive nominees insert error:', nomineeError);
    await rollback();
    return NextResponse.json({ ok: false, error: 'Не удалось сохранить победителей' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, season, nominations: parsed.nominations.length, winners: nominees.length });
}
