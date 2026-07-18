-- SWV — полная схема базы данных
-- Выполнить целиком в Supabase SQL Editor при создании НОВОГО проекта.
-- Если у тебя уже накатан старый schema.sql — используй
-- supabase/migration_001_swv_sections.sql вместо этого файла.

create extension if not exists "pgcrypto";

-- Сезоны SWAG Awards: один ряд на каждый год проведения.
-- Именно сезон переключает "текущее голосование" и хранит
-- дедлайн/флаг публикации результатов для конкретного года.
create table seasons (
  id uuid primary key default gen_random_uuid(),
  label text not null,                    -- например "SWAG 2026"
  is_current boolean not null default false,
  voting_deadline timestamptz,
  results_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Гарантируем, что текущий сезон только один
create unique index one_current_season on seasons (is_current) where is_current = true;

-- Номинации, например "Душа компании", "Мем года" — принадлежат сезону
create table nominations (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Номинанты внутри номинации
create table nominees (
  id uuid primary key default gen_random_uuid(),
  nomination_id uuid not null references nominations(id) on delete cascade,
  name text not null,
  avatar_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Одноразовые коды голосующих (привязаны к сезону — на новый год генерируются новые)
create table voter_codes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references seasons(id) on delete cascade,
  code text not null unique,
  label text,              -- необязательная пометка для админа, кому выдан код
  is_used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Голоса: один голос на пару (код, номинация)
create table votes (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references voter_codes(id) on delete cascade,
  nomination_id uuid not null references nominations(id) on delete cascade,
  nominee_id uuid not null references nominees(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (code_id, nomination_id)
);

-- Пароль админки (одна строка на весь сайт, не привязан к сезону)
create table admin_settings (
  id int primary key default 1,
  admin_password_hash text not null,
  constraint single_row check (id = 1)
);

-- ==========================================================
-- SWV: остальные разделы сайта (глоссарий, айсберг, история, мемы)
-- ==========================================================

create type content_status as enum ('published', 'pending', 'rejected');

create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create table iceberg_entries (
  id uuid primary key default gen_random_uuid(),
  level int not null,
  title text not null,
  description text,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create table history_events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  title text not null,
  description text,
  image_url text,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create table memes (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  status content_status not null default 'published',
  created_at timestamptz not null default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('member', 'iceberg', 'history', 'meme')),
  target_id uuid,
  payload jsonb not null,
  submitter_name text,
  status content_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index on nominations (season_id);
create index on nominees (nomination_id);
create index on voter_codes (season_id);
create index on votes (nomination_id);
create index on votes (code_id);
create index on voter_codes (code);
create index on iceberg_entries (level);
create index on history_events (event_date);
create index on submissions (status);

alter table seasons enable row level security;
alter table nominations enable row level security;
alter table nominees enable row level security;
alter table voter_codes enable row level security;
alter table votes enable row level security;
alter table admin_settings enable row level security;
alter table members enable row level security;
alter table iceberg_entries enable row level security;
alter table history_events enable row level security;
alter table memes enable row level security;
alter table submissions enable row level security;

-- Публично можно читать сезоны (для архива по годам) и активные номинации/номинантов
create policy "public read seasons" on seasons for select using (true);
create policy "public read nominations" on nominations for select using (is_active = true);
create policy "public read nominees" on nominees for select using (true);

-- Публично можно читать только опубликованный контент разделов SWV
create policy "public read members" on members for select using (status = 'published');
create policy "public read iceberg" on iceberg_entries for select using (status = 'published');
create policy "public read history" on history_events for select using (status = 'published');
create policy "public read memes" on memes for select using (status = 'published');
-- submissions не читаются публично вообще (это очередь на модерацию,
-- видна только админу через service role key)

-- Всё остальное (коды, голоса, пароль, запись/изменение чего-либо)
-- идёт только через серверные route'ы с service role key, обходящим RLS.

-- Storage: бакет для загруженных картинок (создаётся один раз, вручную
-- в Supabase Dashboard -> Storage -> New bucket -> "images", публичный).
