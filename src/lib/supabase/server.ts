import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseSecretKey } from '@/lib/env';

// Клиент для серверных API route'ов и серверных компонентов. Использует
// secret-ключ, который обходит RLS — поэтому этот файл нельзя импортировать
// в клиентский код (дополнительно защищён через `import 'server-only'`).
//
// Функция, а не общий инстанс: в serverless-окружении (Vercel) на каждый
// запрос может подниматься новый процесс, так что дешевле и безопаснее
// создавать клиент по требованию, чем держать один общий на всё время жизни.
export function createServerClient() {
  return createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: { persistSession: false },
  });
}
