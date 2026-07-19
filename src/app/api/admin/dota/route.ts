import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// GET — список зарегистрированных игроков (для админки)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('dota_players')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить игроков' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, players: data });
}

// POST { name, steamAccountId } — добавить игрока
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { name, steamAccountId } = body ?? {};

  if (!name || !steamAccountId || isNaN(Number(steamAccountId))) {
    return NextResponse.json(
      { ok: false, error: 'Нужны имя и числовой Steam Account ID (32-bit)' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('dota_players')
    .insert({ name, steam_account_id: Number(steamAccountId) })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message.includes('duplicate') ? 'Такой Steam ID уже добавлен' : 'Не удалось добавить игрока' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, player: data });
}

// DELETE { id } — удалить игрока
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
  const { error } = await supabase.from('dota_players').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось удалить игрока' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
