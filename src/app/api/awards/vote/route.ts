import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getVoterCodeId, clearVoterSession } from '@/lib/auth';

type VotePayload = { nominationId: string; nomineeId: string };

// POST { votes: { nominationId, nomineeId }[] }
// Требует активную voter-сессию. Проверяет код, сезон, дедлайн и что каждый
// голос валиден (номинация из сезона кода и активна, номинант принадлежит
// этой номинации, без дубликатов). Атомарно занимает код, сохраняет голоса,
// закрывает сессию.
export async function POST(req: NextRequest) {
  const supabase = createServerClient();

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

  const { data: codeRow, error: codeError } = await supabase
    .from('voter_codes')
    .select('id, is_used, season_id')
    .eq('id', codeId)
    .maybeSingle();

  if (codeError || !codeRow) {
    return NextResponse.json({ ok: false, error: 'Код не найден' }, { status: 404 });
  }

  if (codeRow.is_used) {
    return NextResponse.json({ ok: false, error: 'Этот код уже использован' }, { status: 409 });
  }

  const { data: season } = await supabase
    .from('seasons')
    .select('voting_deadline')
    .eq('id', codeRow.season_id)
    .maybeSingle();

  if (season?.voting_deadline && new Date(season.voting_deadline) < new Date()) {
    return NextResponse.json({ ok: false, error: 'Голосование уже завершено' }, { status: 403 });
  }

  // Активные номинации сезона кода + их номинанты — для валидации голосов.
  const { data: nominations, error: nomError } = await supabase
    .from('nominations')
    .select('id, is_active, nominees(id)')
    .eq('season_id', codeRow.season_id);

  if (nomError || !nominations) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить номинации' }, { status: 500 });
  }

  const nomineeIdsByNomination = new Map<string, Set<string>>();
  const activeNominationIds = new Set<string>();
  for (const n of nominations) {
    if (!n.is_active) continue;
    activeNominationIds.add(n.id);
    const ids = new Set<string>();
    for (const nominee of (n.nominees as { id: string }[] | null) ?? []) {
      ids.add(nominee.id);
    }
    nomineeIdsByNomination.set(n.id, ids);
  }

  const seenNominations = new Set<string>();
  const rows: { code_id: string; nomination_id: string; nominee_id: string }[] = [];

  for (const v of votes) {
    if (!v || typeof v.nominationId !== 'string' || typeof v.nomineeId !== 'string') {
      return NextResponse.json({ ok: false, error: 'Некорректный голос' }, { status: 400 });
    }
    if (!activeNominationIds.has(v.nominationId)) {
      return NextResponse.json(
        { ok: false, error: 'Номинация недоступна для голосования' },
        { status: 400 }
      );
    }
    if (seenNominations.has(v.nominationId)) {
      return NextResponse.json(
        { ok: false, error: 'Нельзя голосовать дважды в одной номинации' },
        { status: 400 }
      );
    }
    const nomineeIds = nomineeIdsByNomination.get(v.nominationId)!;
    if (!nomineeIds.has(v.nomineeId)) {
      return NextResponse.json(
        { ok: false, error: 'Номинант не относится к этой номинации' },
        { status: 400 }
      );
    }
    seenNominations.add(v.nominationId);
    rows.push({
      code_id: codeId,
      nomination_id: v.nominationId,
      nominee_id: v.nomineeId,
    });
  }

  // Атомарно занимаем код: только один запрос сможет переключить is_used
  // false → true, остальные получат 0 строк и уйдут с 409. Это закрывает
  // гонку «проверил → вставил → пометил».
  const { data: claimed, error: claimError } = await supabase
    .from('voter_codes')
    .update({ is_used: true, used_at: new Date().toISOString() })
    .eq('id', codeId)
    .eq('is_used', false)
    .select('id')
    .maybeSingle();

  if (claimError || !claimed) {
    return NextResponse.json({ ok: false, error: 'Этот код уже использован' }, { status: 409 });
  }

  const { error: votesError } = await supabase.from('votes').insert(rows);
  if (votesError) {
    console.error('vote insert error:', votesError);
    // Откатываем код, чтобы можно было повторить сохранение.
    await supabase
      .from('voter_codes')
      .update({ is_used: false, used_at: null })
      .eq('id', codeId)
      .eq('is_used', true);
    return NextResponse.json({ ok: false, error: 'Не удалось сохранить голоса' }, { status: 500 });
  }

  await clearVoterSession();
  return NextResponse.json({ ok: true });
}
