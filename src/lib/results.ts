import type { SupabaseClient } from '@supabase/supabase-js';
import type { NominationResult } from '@/lib/types';

// Считает расклад голосов по всем номинациям сезона.
// topN ограничивает список кандидатов на выходе (для публичной страницы
// нужен топ-3, для админки — передать Infinity, чтобы видеть всех).
export async function computeSeasonResults(
  supabase: SupabaseClient,
  seasonId: string,
  topN: number = Infinity
): Promise<NominationResult[]> {  const { data: nominations } = await supabase
    .from('nominations')
    .select('*, nominees(*)')
    .eq('season_id', seasonId)
    .order('sort_order', { ascending: true });

  if (!nominations || nominations.length === 0) return [];

  const nominationIds = nominations.map((n) => n.id);
  const { data: votes } = await supabase
    .from('votes')
    .select('nomination_id, nominee_id')
    .in('nomination_id', nominationIds);

  const countsByNomination = new Map<string, Map<string, number>>();
  for (const vote of votes ?? []) {
    if (!countsByNomination.has(vote.nomination_id)) {
      countsByNomination.set(vote.nomination_id, new Map());
    }
    const counts = countsByNomination.get(vote.nomination_id)!;
    counts.set(vote.nominee_id, (counts.get(vote.nominee_id) ?? 0) + 1);
  }

  return nominations.map((nomination) => {
    const { nominees, ...nominationFields } = nomination;
    const counts = countsByNomination.get(nomination.id) ?? new Map();

    const standings = (nominees ?? [])
      .map((nominee: { id: string }) => ({
        nominee,
        voteCount: counts.get(nominee.id) ?? 0,
      }))
      .sort((a: { voteCount: number }, b: { voteCount: number }) => b.voteCount - a.voteCount)
      .slice(0, topN);

    return { nomination: nominationFields, standings };
  });
}

export type VoterBreakdownEntry = {
  codeId: string;
  code: string;
  label: string | null;
  isUsed: boolean;
  choices: { nominationTitle: string; nomineeName: string }[];
};

// Раскладка "кто как голосовал" по сезону: каждый код (с его меткой,
// если админ указал имя при генерации) и что он выбрал в каждой номинации.
export async function getSeasonVoterBreakdown(
  supabase: SupabaseClient,
  seasonId: string
): Promise<VoterBreakdownEntry[]> {
  const { data: codes } = await supabase
    .from('voter_codes')
    .select('id, code, label, is_used')
    .eq('season_id', seasonId)
    .order('created_at', { ascending: true });

  if (!codes || codes.length === 0) return [];

  const codeIds = codes.map((c) => c.id);
  const { data: votes } = await supabase
    .from('votes')
    .select('code_id, nominations(title), nominees(name)')
    .in('code_id', codeIds);

  const choicesByCode = new Map<string, { nominationTitle: string; nomineeName: string }[]>();
  for (const vote of votes ?? []) {
    const nomination = vote.nominations as unknown as { title: string } | null;
    const nominee = vote.nominees as unknown as { name: string } | null;
    if (!choicesByCode.has(vote.code_id)) choicesByCode.set(vote.code_id, []);
    choicesByCode.get(vote.code_id)!.push({
      nominationTitle: nomination?.title ?? '—',
      nomineeName: nominee?.name ?? '—',
    });
  }

  return codes.map((code) => ({
    codeId: code.id,
    code: code.code,
    label: code.label,
    isUsed: code.is_used,
    choices: choicesByCode.get(code.id) ?? [],
  }));
}
