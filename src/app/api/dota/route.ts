import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { fetchDotaPlayer } from '@/lib/dota';

// GET ?force=1 — лидерборд по всем зарегистрированным игрокам, отсортированный
// по рангу. Данные подтягиваются с OpenDota в реальном времени (с кэшем
// на 5 минут, если не передан force=1), никакого ручного ввода ММР.
export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get('force') === '1';
  const supabase = createServerClient();
  const { data: players, error } = await supabase.from('dota_players').select('*');

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить список игроков' }, { status: 500 });
  }

  const stats = await Promise.all(
    (players ?? []).map((p) => fetchDotaPlayer(p.id, p.name, p.steam_account_id, { force }))
  );

  stats.sort((a, b) => b.rankValue - a.rankValue);

  return NextResponse.json({ ok: true, players: stats });
}
