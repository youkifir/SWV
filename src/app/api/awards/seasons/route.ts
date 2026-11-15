import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Всегда свежий список сезонов для страницы результатов (никакого кэша),
// чтобы удалённый или переименованный сезон сразу пропадал/менялся на сайте.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('seasons')
    .select('id, label, is_current, is_archive, results_published, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить сезоны' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({ ok: true, seasons: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}
