import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { getSeasonVoterBreakdown } from '@/lib/results';

// GET ?seasonId=... — по каждому коду сезона: метка (если указана при
// генерации) и что этот код выбрал в каждой номинации. По умолчанию —
// текущий сезон. Только для админки — раскрывает анонимность голосования.
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  let seasonId = req.nextUrl.searchParams.get('seasonId');

  if (!seasonId) {
    const { data: current } = await supabase
      .from('seasons')
      .select('id')
      .eq('is_current', true)
      .maybeSingle();
    seasonId = current?.id ?? null;
  }

  if (!seasonId) {
    return NextResponse.json({ ok: true, breakdown: [] });
  }

  const breakdown = await getSeasonVoterBreakdown(supabase, seasonId);
  return NextResponse.json({ ok: true, breakdown });
}
