import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';

// Авторизация без OAuth и без паролей у голосующих — код в обмен на
// подписанную httpOnly cookie. Подпись через HMAC на SESSION_SECRET,
// так что подделать cookie руками нельзя, не зная секрета.

const VOTER_COOKIE = 'voter_session';
const ADMIN_COOKIE = 'admin_session';
const VOTER_MAX_AGE = 60 * 60 * 6; // 6 часов — с запасом на прохождение всех номинаций
const ADMIN_MAX_AGE = 60 * 60 * 24 * 7; // неделя

function sign(value: string): string {
  const sig = createHmac('sha256', process.env.SESSION_SECRET!).update(value).digest('hex');
  return `${value}.${sig}`;
}

function unsign(signed: string): string | null {
  const i = signed.lastIndexOf('.');
  if (i === -1) return null;
  const value = signed.slice(0, i);
  const sig = signed.slice(i + 1);
  const expected = createHmac('sha256', process.env.SESSION_SECRET!).update(value).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

// --- Сессия голосующего ---

export async function createVoterSession(codeId: string) {
  const store = await cookies();
  store.set(VOTER_COOKIE, sign(codeId), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: VOTER_MAX_AGE,
    path: '/',
  });
}

export async function getVoterCodeId(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(VOTER_COOKIE)?.value;
  return raw ? unsign(raw) : null;
}

export async function clearVoterSession() {
  const store = await cookies();
  store.delete(VOTER_COOKIE);
}

// --- Сессия админа ---
// Пароль хранится как bcrypt-хэш в admin_settings.admin_password_hash.
// Особый случай: если строки в admin_settings ещё нет, первый же успешный
// POST /api/admin/login сохраняет введённый пароль как пароль админки —
// отдельный скрипт для первичной настройки не нужен.

export async function validateAdminPassword(password: string): Promise<boolean> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('admin_settings')
    .select('admin_password_hash')
    .eq('id', 1)
    .maybeSingle();
  if (!data) return false;
  return bcrypt.compare(password, data.admin_password_hash);
}

export async function createAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, sign('admin'), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: ADMIN_MAX_AGE,
    path: '/',
  });
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE)?.value;
  return raw ? unsign(raw) === 'admin' : false;
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

// Хелпер для защищённых admin-роутов: возвращает true, если сессия валидна.
// Использование в начале route-хендлера:
//   if (!(await requireAdmin())) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
export async function requireAdmin(): Promise<boolean> {
  return isAdminSession();
}
