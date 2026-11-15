import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
const bad = (error: string) => NextResponse.json({ ok: false, error }, { status: 400 });

function checkName(name: unknown): string | null {
  return typeof name === 'string' && name.trim() && name.trim().length <= 100 ? name.trim() : null;
}
// place: null или 1..3; votes: null или целое >= 0 (нужны только для архивных сезонов)
function checkPlace(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  return [1, 2, 3].includes(Number(v)) ? Number(v) : undefined;
}
function checkVotes(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  return Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 999999 ? Number(v) : undefined;
}
function checkUrl(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  return typeof v === 'string' && /^https?:\/\/\S+$/i.test(v) ? v : undefined;
}

// POST { nominationId, name, avatarUrl?, place?, archiveVotes? } — добавить номинанта
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const { nominationId, name, avatarUrl, place, archiveVotes } = body ?? {};
  const cleanName = checkName(name);
  if (!nominationId || typeof nominationId !== 'string' || !cleanName) return bad('Нужны номинация и имя (до 100 символов)');

  const url = checkUrl(avatarUrl);
  const pl = checkPlace(place);
  const votes = checkVotes(archiveVotes);
  if (avatarUrl !== undefined && avatarUrl !== null && url === undefined) return bad('Ссылка на фото должна начинаться с http(s)://');
  if (place !== undefined && place !== null && place !== '' && pl === undefined) return bad('Место — число от 1 до 3');
  if (archiveVotes !== undefined && archiveVotes !== null && archiveVotes !== '' && votes === undefined) return bad('Голоса — целое число');

  const supabase = createServerClient();
  const { data: last } = await supabase
    .from('nominees')
    .select('sort_order')
    .eq('nomination_id', nominationId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from('nominees')
    .insert({
      nomination_id: nominationId,
      name: cleanName,
      avatar_url: url ?? null,
      sort_order: (last?.sort_order ?? -1) + 1,
      place: pl ?? null,
      archive_votes: votes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('nominee insert error:', error);
    return NextResponse.json({ ok: false, error: 'Не удалось добавить номинанта' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, nominee: data });
}

// PATCH { id, name?, avatarUrl?, sortOrder?, place?, archiveVotes? } — обновить
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const { id, name, avatarUrl, sortOrder, place, archiveVotes } = body ?? {};
  if (!id || typeof id !== 'string') return bad('Нужен id');

  const update: Record<string, unknown> = {};
  if (name !== undefined) {
    const n = checkName(name);
    if (!n) return bad('Имя — от 1 до 100 символов');
    update.name = n;
  }
  if (avatarUrl !== undefined) {
    const u = checkUrl(avatarUrl);
    if (u === undefined) return bad('Ссылка на фото должна начинаться с http(s)://');
    update.avatar_url = u;
  }
  if (place !== undefined) {
    const p = checkPlace(place);
    if (p === undefined) return bad('Место — число от 1 до 3');
    update.place = p;
  }
  if (archiveVotes !== undefined) {
    const v = checkVotes(archiveVotes);
    if (v === undefined) return bad('Голоса — целое число');
    update.archive_votes = v;
  }
  if (sortOrder !== undefined) {
    if (!Number.isInteger(sortOrder)) return bad('sortOrder — целое число');
    update.sort_order = sortOrder;
  }
  if (Object.keys(update).length === 0) return bad('Нечего обновлять');

  const supabase = createServerClient();
  const { data, error } = await supabase.from('nominees').update(update).eq('id', id).select().single();
  if (error) {
    console.error('nominee update error:', error);
    return NextResponse.json({ ok: false, error: 'Не удалось обновить номинанта' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, nominee: data });
}

// DELETE { id }
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (!id || typeof id !== 'string') return bad('Нужен id');
  const supabase = createServerClient();
  const { error } = await supabase.from('nominees').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: 'Не удалось удалить номинанта' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
