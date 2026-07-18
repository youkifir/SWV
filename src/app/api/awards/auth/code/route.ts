import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createVoterSession } from '@/lib/auth';

// POST { code: string }
// Ищет код в voter_codes. Если найден и не использован — открывает
// voter-сессию (cookie) и разрешает перейти на /vote.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawCode = body?.code;

  if (!rawCode || typeof rawCode !== 'string') {
    return NextResponse.json({ ok: false, error: 'Введите код' }, { status: 400 });
  }

  const code = rawCode.trim().toUpperCase();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('voter_codes')
    .select('id, is_used')
    .eq('code', code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Код не найден' }, { status: 404 });
  }

  if (data.is_used) {
    return NextResponse.json({ ok: false, error: 'Этот код уже использован' }, { status: 409 });
  }

  await createVoterSession(data.id);
  return NextResponse.json({ ok: true });
}
