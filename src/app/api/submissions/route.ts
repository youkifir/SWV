import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const VALID_TYPES = ['member', 'iceberg', 'history', 'meme'];

// POST { type, payload, submitterName?, targetId? }
// Открытый эндпоинт без авторизации (доверенный круг друзей). Просто
// кладёт заявку в очередь на модерацию — ничего не публикует напрямую.
// payload — произвольный объект полей формы, зависит от type:
//   member:  { name, description?, avatarUrl? }
//   iceberg: { level, title, description? }
//   history: { eventDate, title, description?, imageUrl? }
//   meme:    { imageUrl, caption? }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { type, payload, submitterName, targetId } = body ?? {};

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, error: 'Неизвестный тип заявки' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false, error: 'Нужен payload' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from('submissions').insert({
    type,
    payload,
    submitter_name: submitterName ?? null,
    target_id: targetId ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось отправить заявку' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
