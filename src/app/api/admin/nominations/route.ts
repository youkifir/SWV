import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET ?seasonId=... — список номинаций сезона (для админки, включая неактивные).
// Если seasonId не передан — берёт текущий сезон.
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
    return NextResponse.json({ ok: true, nominations: [], seasonId: null });
  }

  const { data, error } = await supabase
    .from('nominations')
    .select('*, nominees(*)')
    .eq('season_id', seasonId)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить номинации' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, nominations: data, seasonId });
}

// POST { seasonId, title, description?, coverImageUrl? } — создать номинацию
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { seasonId, title, description, coverImageUrl } = body ?? {};

  if (!seasonId || !title) {
    return NextResponse.json({ ok: false, error: 'Нужны seasonId и title' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('nominations')
    .insert({
      season_id: seasonId,
      title,
      description: description ?? null,
      cover_image_url: coverImageUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось создать номинацию' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, nomination: data });
}

// PATCH { id, title?, description?, coverImageUrl?, isActive?, sortOrder? } — обновить
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { id, title, description, coverImageUrl, isActive, sortOrder } = body ?? {};
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Нужен id' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (title !== undefined) update.title = title;
  if (description !== undefined) update.description = description;
  if (coverImageUrl !== undefined) update.cover_image_url = coverImageUrl;
  if (isActive !== undefined) update.is_active = isActive;
  if (sortOrder !== undefined) update.sort_order = sortOrder;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('nominations')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось обновить номинацию' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, nomination: data });
}

// DELETE { id } — удалить (каскадно удалит номинантов и голоса по ней)
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Нужен id' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from('nominations').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось удалить номинацию' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
