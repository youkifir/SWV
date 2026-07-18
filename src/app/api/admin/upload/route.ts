import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 МБ
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// POST multipart/form-data { file }
// Загружает картинку в Supabase Storage (бакет "images"), возвращает { url }.
// Используется и для аватарки номинанта/участника, и для обложки номинации,
// и для картинок мемов/истории.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Файл не найден' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ ok: false, error: 'Разрешены только картинки (jpeg/png/webp/gif)' }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ ok: false, error: 'Файл больше 5 МБ' }, { status: 400 });
  }

  const supabase = createServerClient();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from('images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить файл' }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(path);
  return NextResponse.json({ ok: true, url: publicUrlData.publicUrl });
}
