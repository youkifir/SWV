-- Миграция 002: страница ММР игроков Dota 2
-- Выполнить в Supabase SQL Editor поверх уже применённых предыдущих миграций.

create table dota_players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  steam_account_id bigint not null unique,
  created_at timestamptz not null default now()
);

alter table dota_players enable row level security;
-- Публичного чтения не даём — страница /dota ходит через серверный API,
-- который сам обращается к таблице с service role key.
