-- Миграция 001: сезоны SWAG Awards + разделы SWV (глоссарий, айсберг,
-- история, мемы, заявки на модерацию).
-- Выполнить в Supabase SQL Editor ПОСЛЕ уже применённого schema.sql
-- (той версии, где были только nominations/nominees/voter_codes/votes/event_settings).

-- 1) Сезоны: заводим таблицу и переносим в неё текущие номинации/коды как "первый сезон"
create table seasons (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  is_current boolean not null default false,
  voting_deadline timestamptz,
  results_published boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index one_current_season on seasons (is_current) where is_current = true;

insert into seasons (label, is_current, voting_deadline, results_published)
select 'SWAG ' || extract(year from now())::text, true, voting_deadline, results_published
from event_settings
where id = 1;

-- Если event_settings почему-то была пустой — подстрахуемся дефолтным сезоном
insert into seasons (label, is_current)
select 'SWAG ' || extract(year from now())::text, true
where not exists (select 1 from seasons);

alter table nominations add column season_id uuid references seasons(id);
update nominations set season_id = (select id from seasons where is_current = true limit 1);
alter table nominations alter column season_id set not null;

alter table voter_codes add column season_id uuid references seasons(id);
update voter_codes set season_id = (select id from seasons where is_current = true limit 1);
alter table voter_codes alter column season_id set not null;

create index on nominations (season_id);
create index on voter_codes (season_id);

-- 2) Пароль админки переезжает в отдельную таблицу, event_settings больше не нужна
create table admin_settings (
  id int primary key default 1,
  admin_password_hash text not null,
  constraint single_row check (id = 1)
);

insert into admin_settings (id, admin_password_hash)
select 1, admin_password_hash from event_settings where id = 1
on conflict (id) do nothing;

drop table event_settings;

alter table seasons enable row level security;
alter table admin_settings enable row level security;
create policy "public read seasons" on seasons for select using (true);

-- 3) Разделы SWV
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

create index on iceberg_entries (level);
create index on history_events (event_date);
create index on submissions (status);

alter table members enable row level security;
alter table iceberg_entries enable row level security;
alter table history_events enable row level security;
alter table memes enable row level security;
alter table submissions enable row level security;

create policy "public read members" on members for select using (status = 'published');
create policy "public read iceberg" on iceberg_entries for select using (status = 'published');
create policy "public read history" on history_events for select using (status = 'published');
create policy "public read memes" on memes for select using (status = 'published');
