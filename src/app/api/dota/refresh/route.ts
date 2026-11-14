import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requestDotaRefresh, clearDotaCache } from '@/lib/dota';
import { isRateLimited, ipKey } from '@/lib/rate-limit';

// Общая пауза между массовыми обновлениями (на один инстанс), чтобы сайт
// не долбил OpenDota, даже если кнопку жмут десятки людей.
let lastRefreshAllAt = 0;
const GLOBAL_COOLDOWN_MS = 60_000;

// POST — просит OpenDota пересобрать данные ВСЕХ игроков из нашей таблицы
// (id берутся из БД, произвольные Steam ID через сайт не принимаются).
export async function POST(req: NextRequest) {
  if (isRateLimited(`dota-refresh:${ipKey(req)}`, 3, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: 'Слишком часто — попробуйте через несколько минут' }, { status: 429 });
  }

  const now = Date.now();
  if (now - lastRefreshAllAt < GLOBAL_COOLDOWN_MS) {
    // Кто-то уже недавно обновил — отдельный запрос в OpenDota не нужен
    return NextResponse.json({ ok: true, throttled: true });
  }
  lastRefreshAllAt = now;

  const supabase = createServerClient();
  const { data: players, error } = await supabase.from('dota_players').select('steam_account_id');
  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить список игроков' }, { status: 500 });
  }

  const results = await Promise.all(
    (players ?? []).map(async (p) => {
      const ok = await requestDotaRefresh(p.steam_account_id);
      clearDotaCache(p.steam_account_id);
      return ok;
    })
  );

  return NextResponse.json({ ok: true, requested: results.length, succeeded: results.filter(Boolean).length });
}
