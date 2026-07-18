import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET — список всех сезонов (для селектора в админке и архива на публичной странице)
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить сезоны' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, seasons: data });
}

// POST { label: string } — создать новый сезон и сделать его текущим.
// Предыдущий текущий сезон автоматически перестаёт быть текущим
// (частичный уникальный индекс one_current_season разрешает только один is_current=true).
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const label = body?.label;
  if (!label || typeof label !== 'string') {
    return NextResponse.json({ ok: false, error: 'Укажите название сезона' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { error: unsetError } = await supabase
    .from('seasons')
    .update({ is_current: false })
    .eq('is_current', true);

  if (unsetError) {
    return NextResponse.json({ ok: false, error: 'Не удалось переключить сезон' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('seasons')
    .insert({ label, is_current: true })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось создать сезон' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, season: data });
}
