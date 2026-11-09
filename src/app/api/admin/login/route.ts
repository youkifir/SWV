import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminSession } from '@/lib/auth';
import { isRateLimited, ipKey } from '@/lib/rate-limit';

// POST { password: string }
// Если admin_settings ещё пустая — первый введённый пароль становится
// паролем админки (если задан BOOTSTRAP_ADMIN_PASSWORD, то только он).
// Иначе — обычная проверка.
export async function POST(req: NextRequest) {
  if (isRateLimited(`admin-login:${ipKey(req)}`, 10, 5 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: 'Слишком много попыток входа, попробуй позже' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (!password || typeof password !== 'string' || password.length < 6) {
    return NextResponse.json(
      { ok: false, error: 'Пароль должен быть не короче 6 символов' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { data, error: selectError } = await supabase
    .from('admin_settings')
    .select('admin_password_hash')
    .eq('id', 1)
    .maybeSingle();

  if (selectError) {
    console.error('admin_settings select error:', selectError);
    return NextResponse.json({ ok: false, error: 'Не удалось проверить пароль' }, { status: 500 });
  }

  if (!data) {
    // Первый вход: устанавливаем пароль. Если задан BOOTSTRAP_ADMIN_PASSWORD,
    // принять можно только его — защита от перехвата админки сразу после деплоя.
    const bootstrap = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (bootstrap && password !== bootstrap) {
      return NextResponse.json({ ok: false, error: 'Неверный пароль' }, { status: 401 });
    }

    const hash = await bcrypt.hash(password, 10);
    const { error: insertError } = await supabase
      .from('admin_settings')
      .insert({ id: 1, admin_password_hash: hash });

    if (insertError) {
      console.error('admin_settings insert error:', insertError);
      return NextResponse.json({ ok: false, error: 'Не удалось сохранить пароль' }, { status: 500 });
    }

    await createAdminSession();
    return NextResponse.json({ ok: true, created: true });
  }

  const valid = await bcrypt.compare(password, data.admin_password_hash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'Неверный пароль' }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
