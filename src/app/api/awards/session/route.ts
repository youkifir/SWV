import { NextResponse } from 'next/server';
import { getVoterCodeId } from '@/lib/auth';

// GET — есть ли активная voter-сессия (человек ввёл верный код).
// Используется страницей /awards/vote, чтобы сразу отправить обратно
// на /awards, если код ещё не вводили или сессия истекла.
export async function GET() {
  const codeId = await getVoterCodeId();
  return NextResponse.json({ ok: true, hasSession: Boolean(codeId) });
}
