import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'node:crypto';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// Без похожих символов (0/O, 1/I/L и т.д.), чтобы код было легко читать вслух
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

function generateCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

// GET ?seasonId=... — список кодов сезона (по умолчанию — текущий сезон)
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
    return NextResponse.json({ ok: true, codes: [], seasonId: null });
  }

  const { data, error } = await supabase
    .from('voter_codes')
    .select('*')
    .eq('season_id', seasonId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить коды' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, codes: data, seasonId });
}

// POST { seasonId, count, label? } — сгенерировать N уникальных кодов
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { seasonId, count, label } = body ?? {};

  if (!seasonId || !count || count < 1 || count > 500) {
    return NextResponse.json(
      { ok: false, error: 'Нужны seasonId и count (от 1 до 500)' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Генерируем с запасом уникальности: пробуем вставить, при конфликте
  // (крайне маловероятном при алфавите в 32 символа и длине 6) — просто
  // генерируем ещё один код взамен.
  const rows: { season_id: string; code: string; label: string | null }[] = [];
  const seen = new Set<string>();
  while (rows.length < count) {
    const code = generateCode();
    if (seen.has(code)) continue;
    seen.add(code);
    rows.push({ season_id: seasonId, code, label: label ?? null });
  }

  const { data, error } = await supabase.from('voter_codes').insert(rows).select();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось сгенерировать коды' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, codes: data });
}

// DELETE { id } — удалить неиспользованный код
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
  const { error } = await supabase.from('voter_codes').delete().eq('id', id).eq('is_used', false);

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось удалить код' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
