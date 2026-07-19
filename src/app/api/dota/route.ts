import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { fetchDotaPlayer } from '@/lib/dota';

// GET — лидерборд по всем зарегистрированным игрокам, отсортированный
// по рангу. Данные подтягиваются с OpenDota в реальном времени (с кэшем
// на 5 минут), никакого ручного ввода ММР.
export async function GET() {
  const supabase = createServerClient();
  const { data: players, error } = await supabase.from('dota_players').select('*');

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить список игроков' }, { status: 500 });
  }

  const stats = await Promise.all(
    (players ?? []).map((p) => fetchDotaPlayer(p.id, p.name, p.steam_account_id))
  );

  stats.sort((a, b) => b.rankValue - a.rankValue);

  return NextResponse.json({ ok: true, players: stats });
}
