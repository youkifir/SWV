// POST { votes: { nominationId: string, nomineeId: string }[] }
// Требует активную voter-сессию. Проверяет, что код ещё не is_used,
// вставляет строки в votes (по одной на номинацию, unique constraint
// на code_id+nomination_id защищает от повторов), затем помечает
// voter_codes.is_used = true, used_at = now(). Всё в одной транзакции.
//
// TODO: export async function POST(req: Request)
