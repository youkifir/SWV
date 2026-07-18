import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { computeSeasonResults } from '@/lib/results';

// GET ?seasonId=... — полный расклад голосов по всем номинациям и кандидатам
// (без ограничения топ-3 — это live-превью для организатора, видно всегда,
// вне зависимости от results_published). По умолчанию — текущий сезон.
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
    return NextResponse.json({ ok: true, results: [] });
  }

  const results = await computeSeasonResults(supabase, seasonId, Infinity);
  return NextResponse.json({ ok: true, results });
}

// PATCH { seasonId, published: boolean } — переключить публикацию результатов сезона
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { seasonId, published } = body ?? {};
  if (!seasonId || typeof published !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'Нужны seasonId и published' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('seasons')
    .update({ results_published: published })
    .eq('id', seasonId);

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось обновить статус публикации' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
