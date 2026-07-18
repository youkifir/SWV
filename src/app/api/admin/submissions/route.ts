import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const TABLE_BY_TYPE: Record<string, string> = {
  member: 'members',
  iceberg: 'iceberg_entries',
  history: 'history_events',
  meme: 'memes',
};

// Приводит payload (camelCase из формы) к полям целевой таблицы (snake_case).
// edits, если переданы админом при одобрении, перекрывают поля из исходной заявки.
function toTableRow(
  type: string,
  payload: Record<string, unknown>,
  edits?: Record<string, unknown>
): Record<string, unknown> | null {
  const merged = { ...payload, ...(edits ?? {}) };

  switch (type) {
    case 'member':
      return {
        name: merged.name,
        description: merged.description ?? null,
        avatar_url: merged.avatarUrl ?? null,
        status: 'published',
      };
    case 'iceberg':
      return {
        level: merged.level,
        title: merged.title,
        description: merged.description ?? null,
        status: 'published',
      };
    case 'history':
      return {
        event_date: merged.eventDate,
        title: merged.title,
        description: merged.description ?? null,
        image_url: merged.imageUrl ?? null,
        status: 'published',
      };
    case 'meme':
      return {
        image_url: merged.imageUrl,
        caption: merged.caption ?? null,
        status: 'published',
      };
    default:
      return null;
  }
}

// GET — очередь заявок со status='pending'
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить заявки' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, submissions: data });
}

// PATCH { id, action: 'approve' | 'reject', edits? }
// approve: переносит payload (+edits поверх) в целевую таблицу — либо
//   обновляет существующую запись (если у заявки есть target_id — это
//   была правка), либо вставляет новую (это была заявка на новую запись).
// reject: просто помечает заявку rejected, никуда ничего не публикует.
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { id, action, edits } = body ?? {};

  if (!id || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ ok: false, error: 'Нужны id и action' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: submission, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !submission) {
    return NextResponse.json({ ok: false, error: 'Заявка не найдена' }, { status: 404 });
  }

  if (action === 'reject') {
    await supabase
      .from('submissions')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    return NextResponse.json({ ok: true });
  }

  const table = TABLE_BY_TYPE[submission.type];
  const row = toTableRow(submission.type, submission.payload, edits);
  if (!table || !row) {
    return NextResponse.json({ ok: false, error: 'Неизвестный тип заявки' }, { status: 400 });
  }

  const { error: publishError } = submission.target_id
    ? await supabase.from(table).update(row as never).eq('id', submission.target_id)
    : await supabase.from(table).insert(row as never);

  if (publishError) {
    return NextResponse.json({ ok: false, error: 'Не удалось опубликовать' }, { status: 500 });
  }

  await supabase
    .from('submissions')
    .update({ status: 'published', reviewed_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({ ok: true });
}
