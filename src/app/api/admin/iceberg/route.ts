import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const unauthorized = () => NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

// GET — все записи айсберга (для админки)
export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('iceberg_entries')
    .select('*')
    .order('level', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: 'Не удалось загрузить записи' }, { status: 500 });
  return NextResponse.json({ ok: true, entries: data });
}

// POST { text } — массовое добавление. Каждая строка: "уровень | заголовок | описание (необязательно)"
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const text: string = typeof body?.text === 'string' ? body.text : '';
  if (!text.trim() || text.length > 20000) {
    return NextResponse.json({ ok: false, error: 'Пустой или слишком длинный текст' }, { status: 400 });
  }

  const rows: { level: number; title: string; description: string | null; status: 'published' }[] = [];
  const lines: string[] = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [rawLevel, rawTitle, ...rest] = line.split('|').map((x: string) => x.trim());
    const level = Number(rawLevel);
    if (!/^\d{1,2}$/.test(rawLevel ?? '') || level < 1 || level > 30) {
      return NextResponse.json({ ok: false, error: `Строка ${i + 1}: уровень — число от 1 до 30` }, { status: 400 });
    }
    if (!rawTitle || rawTitle.length > 150) {
      return NextResponse.json({ ok: false, error: `Строка ${i + 1}: нужен заголовок (до 150 символов)` }, { status: 400 });
    }
    const description = rest.join(' | ').trim();
    if (description.length > 600) {
      return NextResponse.json({ ok: false, error: `Строка ${i + 1}: описание длиннее 600 символов` }, { status: 400 });
    }
    rows.push({ level, title: rawTitle, description: description || null, status: 'published' });
  }

  if (rows.length === 0) return NextResponse.json({ ok: false, error: 'Нет строк для добавления' }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase.from('iceberg_entries').insert(rows);
  if (error) {
    console.error('iceberg insert error:', error);
    return NextResponse.json({ ok: false, error: 'Не удалось сохранить записи' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, added: rows.length });
}

// DELETE { id }
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return unauthorized();
  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (!id || typeof id !== 'string') return NextResponse.json({ ok: false, error: 'Нужен id' }, { status: 400 });
  const supabase = createServerClient();
  const { error } = await supabase.from('iceberg_entries').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: 'Не удалось удалить' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
