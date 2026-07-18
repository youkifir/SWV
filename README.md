# SWV

Сайт-хаб дискорд-сервера: SWAG Awards (ежегодное голосование за номинации),
глоссарий участников, айсберг сервера, история, локальные мемы.

## Стек

- **Next.js** (App Router, TypeScript) — фронтенд + бэкенд (API routes)
- **Supabase** (Postgres + Storage) — база данных и хранилище картинок
- **Vercel** — хостинг и деплой

## Разделы сайта

- `/` — главная-хаб, ссылки на все разделы
- `/awards` — SWAG Awards: вход по коду → голосование → архив прошлых победителей
- `/glossary` — глоссарий участников сервера
- `/iceberg` — айсберг сервера (уровни инсайдерских фактов)
- `/history` — история сервера по датам
- `/memes` — локальные мемы
- `/admin` — панель организатора (за паролем)

## Как устроено голосование в SWAG Awards

Без логинов и паролей у пользователей. Каждому участнику выдаётся
уникальный одноразовый код. По коду человек проходит все номинации
подряд, после чего код помечается использованным и повторно не работает.

## Как устроено наполнение остальных разделов

Смешанная модель: основу (первую версию глоссария, айсберга, истории)
создают админы через `/admin`. Участники сервера могут предлагать
дополнения и правки через открытые формы (`/glossary/submit`,
`/memes/submit` и т.д.) без регистрации — заявка уходит в очередь
на `/admin/submissions`, публикуется только после одобрения.

## Структура проекта

```
src/
  app/
    page.tsx                    — главная-хаб
    awards/
      page.tsx                  — ввод кода
      vote/page.tsx             — голосование
      results/page.tsx          — результаты и архив прошлых победителей
    glossary/
      page.tsx                  — список участников
      submit/page.tsx           — форма предложить участника/правку
    iceberg/page.tsx            — айсберг сервера
    history/page.tsx            — лента истории
    memes/
      page.tsx                  — галерея мемов
      submit/page.tsx           — форма добавить мем
    admin/
      login/page.tsx            — вход в админку по паролю
      page.tsx                  — дашборд
      nominations/page.tsx      — CRUD номинаций и номинантов
      codes/page.tsx            — генерация и список кодов голосующих
      submissions/page.tsx      — очередь модерации пользовательских заявок
    api/
      awards/
        auth/code/route.ts      — POST: проверка кода, начало сессии голосования
        vote/route.ts           — POST: сохранение голоса, финализация кода
      submissions/route.ts      — POST: открытая отправка заявки (любой раздел)
      admin/
        login/route.ts          — POST: проверка/установка пароля админки
        nominations/route.ts    — CRUD номинаций (включая обложку категории)
        nominees/route.ts       — CRUD номинантов (включая аватарку)
        codes/route.ts          — генерация пачки кодов
        results/route.ts        — подсчёт голосов по номинациям
        submissions/route.ts    — GET очередь / PATCH одобрить-отклонить заявку
        upload/route.ts         — загрузка картинок в Supabase Storage
  components/                   — переиспользуемые UI-компоненты
    admin/ImagePicker.tsx       — картинка: ссылка или загрузка файла
  lib/
    supabase/client.ts          — клиент Supabase для браузера
    supabase/server.ts          — клиент Supabase для серверных route'ов
    auth.ts                     — сессии голосующего и админа (подписанные cookie)
    types.ts                    — общие TypeScript-типы
supabase/
  schema.sql                    — полная SQL-схема (для нового проекта с нуля)
  migration_001_swv_sections.sql — миграция: только новые таблицы разделов SWV
                                    (выполнить, если schema.sql уже был применён раньше)
```

## Запуск

1. Создать проект на supabase.com
2. SQL Editor → выполнить `supabase/schema.sql` (если проект новый),
   либо `supabase/migration_001_swv_sections.sql` (если `schema.sql` уже накатан раньше)
3. Storage → создать публичный бакет `images`
4. Project Settings → Data API (Project URL) и API Keys (Publishable key, Secret key)
5. Скопировать `.env.local.example` в `.env.local`, вставить ключи + сгенерировать `SESSION_SECRET`
6. `npm install`
7. `npm run dev`
8. Задеплоить на vercel.com (подключить GitHub-репозиторий)

## Статус

**Бэкенд реализован полностью**, включая:
- Сезоны SWAG Awards (`/api/admin/seasons`) — архив прошлых лет, переключение текущего сезона
- Голосование по коду (`/api/awards/auth/code`, `/api/awards/vote`)
- CRUD номинаций и номинантов (`/api/admin/nominations`, `/api/admin/nominees`)
- Генерация и управление кодами (`/api/admin/codes`)
- Подсчёт результатов: полный для админки, топ-3 публично (`/api/admin/results`, `/api/awards/results`)
- Загрузка картинок в Storage (`/api/admin/upload`)
- Заявки участников и модерация (`/api/submissions`, `/api/admin/submissions`)
- Вход/выход из админки с автоустановкой пароля при первом входе (`/api/admin/login`, `/api/admin/logout`)

**Админка (UI) реализована полностью**: вход, дашборд, сезоны, номинации
с вложенным управлением номинантами, коды с копированием и удалением,
очередь модерации заявок. Дизайн — тёмная тема с латунным акцентом,
шрифты Fraunces (заголовки) + Inter (текст) через `next/font/google`.

Известное упрощение: одобрение заявки в `/admin/submissions` публикует
её как есть (сырой JSON), без формы для правки полей перед публикацией —
API это поддерживает (`edits` в `PATCH /api/admin/submissions`), просто
форма редактирования в UI пока не сделана.

**Публичная часть сайта** — пока скелеты, следующий шаг.

Событие SWAG Awards: примерно через 4-5 месяцев. ~50 голосующих.
