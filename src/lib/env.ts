import 'server-only';

// Единая точка чтения и валидации серверных переменных окружения.
// Падает с понятной ошибкой сразу, если обязательная переменная не задана,
// вместо невнятного "undefined is not a string" где-то в рантайме.

function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Задай её в .env.local (шаблон — .env.local.example).`
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return requireServerEnv('NEXT_PUBLIC_SUPABASE_URL');
}

export function getSupabaseSecretKey(): string {
  return requireServerEnv('SUPABASE_SECRET_KEY');
}

export function getSessionSecret(): string {
  return requireServerEnv('SESSION_SECRET');
}
