import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requestDotaRefresh } from '@/lib/dota';

// POST { playerId } — просит OpenDota пересобрать данные игрока (по id
// из нашей таблицы dota_players, не по голому Steam ID — так не дёргают
// произвольные чужие аккаунты через наш сайт). Публичный, без авторизации:
// это просто просьба обновить публичные данные, вреда в этом нет.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const playerId = body?.playerId;
  if (!playerId) {
    return NextResponse.json({ ok: false, error: 'Нужен playerId' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: player } = await supabase
    .from('dota_players')
    .select('steam_account_id')
    .eq('id', playerId)
    .maybeSingle();

  if (!player) {
    return NextResponse.json({ ok: false, error: 'Игрок не найден' }, { status: 404 });
  }

  const ok = await requestDotaRefresh(player.steam_account_id);
  return NextResponse.json({ ok });
}
