import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getVoterCodeId, clearVoterSession } from '@/lib/auth';

type VotePayload = { nominationId: string; nomineeId: string };

// POST { votes: { nominationId, nomineeId }[] }
// Требует активную voter-сессию. Проверяет, что код ещё не использован,
// сохраняет все голоса разом, помечает код использованным, закрывает сессию.
export async function POST(req: NextRequest) {
  try {
    const codeId = await getVoterCodeId();
    if (!codeId) {
      return NextResponse.json(
        { ok: false, error: 'Сессия истекла, введите код заново' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const votes = body?.votes as VotePayload[] | undefined;

    if (!Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json({ ok: false, error: 'Нет голосов для сохранения' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: codeRow, error: codeError } = await supabase
      .from('voter_codes')
      .select('is_used')
      .eq('id', codeId)
      .maybeSingle();

    if (codeError || !codeRow) {
      return NextResponse.json({ ok: false, error: 'Код не найден' }, { status: 404 });
    }

    if (codeRow.is_used) {
      return NextResponse.json({ ok: false, error: 'Этот код уже использован' }, { status: 409 });
    }

    const rows = votes.map((v) => ({
      code_id: codeId,
      nomination_id: v.nominationId,
      nominee_id: v.nomineeId,
    }));

    const { error: votesError } = await supabase.from('votes').insert(rows);
    if (votesError) {
      console.error('vote insert error:', votesError);
      return NextResponse.json({ ok: false, error: 'Не удалось сохранить голоса' }, { status: 500 });
    }

    await supabase
      .from('voter_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', codeId);

    await clearVoterSession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('vote unexpected error:', err);
    return NextResponse.json(
      { ok: false, error: `Неожиданная ошибка: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
