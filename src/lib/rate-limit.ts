import 'server-only';

// Простейший in-memory rate-limit для открытых/чувствительных эндпоинтов.
// Хранится в globalThis, чтобы переживать hot-reload в dev. Это best-effort
// защита на один инстанс: в serverless-окружении (Vercel) у каждой лямбды
// своё состояние, поэтому это не строгий глобальный лимит, а сдерживание
// очевидного спама. Для строгих лимитов нужен внешний стор (Redis/БД).

type Bucket = { count: number; resetAt: number };

const store = (globalThis as { __rateLimitStore?: Map<string, Bucket> }).__rateLimitStore ??=
  new Map<string, Bucket>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (bucket.count >= limit) {
    return true;
  }

  bucket.count += 1;
  return false;
}

// Ключ по IP. За заголовком X-Forwarded-For стоит быть осторожным (клиент
// может его подделать), но для сдерживания спама этого достаточно.
export function ipKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return ip;
}
