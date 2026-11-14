-- Миграция 004: архив прошлых лет (ручные победители без голосования)
-- Выполнить в Supabase SQL Editor. Для нового проекта те же колонки уже добавлены в schema.sql.
alter table seasons add column if not exists is_archive boolean not null default false;
alter table nominees add column if not exists place smallint check (place between 1 and 3);
alter table nominees add column if not exists archive_votes int check (archive_votes >= 0);
