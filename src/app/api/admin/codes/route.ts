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

// POST { seasonId, count, label? } — сгенерировать N анонимных кодов с одной общей меткой
// POST { seasonId, names: string[] } — сгенерировать по одному именному коду на каждое имя из списка
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { seasonId, count, label, names } = body ?? {};

  if (!seasonId) {
    return NextResponse.json({ ok: false, error: 'Нужен seasonId' }, { status: 400 });
  }

  let labels: (string | null)[];

  if (Array.isArray(names) && names.length > 0) {
    if (names.length > 500) {
      return NextResponse.json({ ok: false, error: 'Не больше 500 имён за раз' }, { status: 400 });
    }
    labels = names.map((n: string) => n.trim()).filter(Boolean);
  } else {
    if (!count || count < 1 || count > 500) {
      return NextResponse.json(
        { ok: false, error: 'Нужны seasonId и count (от 1 до 500), либо список names' },
        { status: 400 }
      );
    }
    labels = Array.from({ length: count }, () => label ?? null);
  }

  const supabase = createServerClient();

  // Генерируем с запасом уникальности: при коллизии (крайне маловероятной
  // при алфавите в 32 символа и длине 6) — просто берём другой код взамен.
  const rows: { season_id: string; code: string; label: string | null }[] = [];
  const seen = new Set<string>();
  for (const entryLabel of labels) {
    let code = generateCode();
    while (seen.has(code)) code = generateCode();
    seen.add(code);
    rows.push({ season_id: seasonId, code, label: entryLabel });
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
