import { createClient } from '@supabase/supabase-js';

// Клиент для серверных API route'ов. Использует secret-ключ, который
// обходит RLS — поэтому этот файл нельзя импортировать в клиентский код,
// только внутри src/app/api/**/route.ts.
//
// Функция, а не общий инстанс: в serverless-окружении (Vercel) на каждый
// запрос может подниматься новый процесс, так что дешевле и безопаснее
// создавать клиент по требованию, чем держать один общий на всё время жизни.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}
