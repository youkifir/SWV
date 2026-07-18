import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// POST { nominationId, name, avatarUrl? } — добавить номинанта
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { nominationId, name, avatarUrl } = body ?? {};

  if (!nominationId || !name) {
    return NextResponse.json({ ok: false, error: 'Нужны nominationId и name' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('nominees')
    .insert({ nomination_id: nominationId, name, avatar_url: avatarUrl ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось добавить номинанта' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, nominee: data });
}

// PATCH { id, name?, avatarUrl?, sortOrder? } — обновить
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { id, name, avatarUrl, sortOrder } = body ?? {};
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Нужен id' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (avatarUrl !== undefined) update.avatar_url = avatarUrl;
  if (sortOrder !== undefined) update.sort_order = sortOrder;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('nominees')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось обновить номинанта' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, nominee: data });
}

// DELETE { id } — удалить
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
  const { error } = await supabase.from('nominees').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось удалить номинанта' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
