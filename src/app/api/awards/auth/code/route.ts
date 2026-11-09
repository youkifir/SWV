import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createVoterSession } from '@/lib/auth';
import { isRateLimited, ipKey } from '@/lib/rate-limit';

// POST { code: string }
// Ищет код в voter_codes среди кодов ТЕКУЩЕГО сезона. Если найден, не
// использован и дедлайн сезона ещё не прошёл — открывает voter-сессию.
export async function POST(req: NextRequest) {
  // Лёгкий rate-limit против перебора кодов.
  if (isRateLimited(`code:${ipKey(req)}`, 20, 60_000)) {
    return NextResponse.json(
      { ok: false, error: 'Слишком много попыток, попробуй чуть позже' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const rawCode = body?.code;

  if (!rawCode || typeof rawCode !== 'string') {
    return NextResponse.json({ ok: false, error: 'Введите код' }, { status: 400 });
  }

  const code = rawCode.trim().toUpperCase();
  const supabase = createServerClient();

  const { data: season } = await supabase
    .from('seasons')
    .select('id, voting_deadline')
    .eq('is_current', true)
    .maybeSingle();

  if (!season) {
    return NextResponse.json(
      { ok: false, error: 'Сезон голосования сейчас не открыт' },
      { status: 404 }
    );
  }

  if (season.voting_deadline && new Date(season.voting_deadline) < new Date()) {
    return NextResponse.json({ ok: false, error: 'Голосование уже завершено' }, { status: 403 });
  }

  // Код ищем только в текущем сезоне — код прошлого года не подходит.
  const { data, error } = await supabase
    .from('voter_codes')
    .select('id, is_used')
    .eq('code', code)
    .eq('season_id', season.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Код не найден' }, { status: 404 });
  }

  if (data.is_used) {
    return NextResponse.json({ ok: false, error: 'Этот код уже использован' }, { status: 409 });
  }

  await createVoterSession(data.id);
  return NextResponse.json({ ok: true });
}
