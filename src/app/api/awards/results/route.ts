import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { computeSeasonResults } from '@/lib/results';

// GET ?seasonId=... — публичные результаты: победитель + топ-3 по каждой
// номинации. Без авторизации, но отдаёт данные только если у сезона
// results_published = true (иначе — { ok: true, published: false }
// и фронт показывает заглушку "результаты объявят после ивента").
// Без seasonId — берёт текущий сезон.
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  let seasonId = req.nextUrl.searchParams.get('seasonId');

  let season;
  if (seasonId) {
    const { data } = await supabase.from('seasons').select('*').eq('id', seasonId).maybeSingle();
    season = data;
  } else {
    const { data } = await supabase.from('seasons').select('*').eq('is_current', true).maybeSingle();
    season = data;
  }

  if (!season) {
    return NextResponse.json({ ok: false, error: 'Сезон не найден' }, { status: 404 });
  }

  if (!season.results_published) {
    return NextResponse.json({ ok: true, published: false, season });
  }

  const results = await computeSeasonResults(supabase, season.id, 3);
  return NextResponse.json({ ok: true, published: true, season, results });
}
