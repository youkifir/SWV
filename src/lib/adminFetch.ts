// Обёртка над fetch для админки: единый разбор ответа, обработка сетевых ошибок
// и редирект на логин, если сессия истекла.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResult = { ok: boolean; error?: string; [key: string]: any };

export async function adminFetch(url: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return { ok: false, error: 'Сессия истекла — войдите заново' };
    }
    const data = await res.json().catch(() => null);
    return data ?? { ok: false, error: 'Неожиданный ответ сервера' };
  } catch {
    return { ok: false, error: 'Не удалось связаться с сервером' };
  }
}
