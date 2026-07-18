import { createClient } from '@supabase/supabase-js';

// Клиент для браузера. Работает с publishable-ключом — доступ к данным
// ограничен политиками RLS из supabase/schema.sql (можно только читать
// активные номинации и номинантов).
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
