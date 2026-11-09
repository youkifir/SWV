-- Миграция 003: удаление разделов «Глоссарий» и «Мемы» и системы заявок.
-- Выполнить в Supabase SQL Editor поверх уже применённых миграций,
-- если сайт уже разворачивался со старыми разделами.

drop table if exists members;
drop table if exists memes;
drop table if exists submissions;
