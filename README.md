# SWV

Сайт-хаб дискорд-сервера: SWAG Awards (ежегодное голосование за номинации
с архивом по сезонам), интерактивный айсберг сервера, история сервера
главами (Canva), лидерборд рангов Dota 2.

## Стек

- **Next.js** (App Router, TypeScript) — фронтенд + бэкенд (API routes)
- **Supabase** (Postgres + Storage) — база данных и хранилище картинок
- **OpenDota API** — автоматическая подтяжка рангов Dota 2 (без ключа)
- **Vercel** — хостинг и деплой

## Разделы сайта

- `/` — главная-хаб, ссылки на все разделы
- `/awards` — SWAG Awards: hero-блок с формой кода + FAQ → `/awards/vote` голосование → `/awards/results` результаты с архивом по сезонам
- `/iceberg` — интерактивный айсберг: чем ниже листаешь, тем темнее фон и глубже уровень
- `/history` — история сервера главами, встроенные Canva-презентации
- `/dota` — ранги Dota 2 участников, подтягиваются автоматически с OpenDota
- `/admin` — панель организатора (за паролем)

## Дизайн

Тёмная и светлая тема (переключатель в шапке и в админке, сохраняется
в localStorage). Яркая современная палитра — почти чёрный фон с мягким
фиолетово-розовым свечением в тёмной теме, тот же градиент как акцент
кнопок и заголовков. Шрифт Unbounded для заголовков + Manrope для текста
через `next/font/google`. Карточки — полупрозрачное стекло с блюром.
Шапка сайта прилипает к верху и прячется при скролле вниз, появляясь
обратно при скролле вверх. Герб сервера (`public/logo.png`, он же favicon
`src/app/icon.png`) в шапке и на главной. Контент плавно проявляется при
скролле через `ScrollReveal`.

## Как устроено голосование в SWAG Awards

Без логинов и паролей у голосующих. Каждый год — отдельный сезон
(`/admin/seasons`), у сезона свои номинации, коды и опциональный дедлайн
голосования; старые сезоны остаются архивом на `/awards/results`. Коды
выдаются анонимной пачкой либо по списку имён — тогда в `/admin/votes`
видно, кто как проголосовал (анонимные пачки остаются анонимными).
Организатор в `/admin/results` видит полную раскладку голосов и публикует
топ-3 по каждой номинации кнопкой.

Если у сезона задан дедлайн, после его наступления новые коды не
активируются и сохранить голос нельзя.

## Как устроено наполнение остальных разделов

Айсберг — свой, интерактивный, данные из таблицы `iceberg_entries`
(редактируются пока напрямую в Supabase). Чем глубже уровень — тем темнее
фон, надписи проявляются по мере скролла.

История — список "глав", каждая — встроенная Canva-презентация
(`src/components/CanvaEmbed.tsx`). Список глав задаётся константой прямо
в `src/app/(site)/history/page.tsx` — новая глава добавляется новым
объектом в массив. Нужна именно embed-ссылка из Canva (Поделиться →
Экспорт → Встроить), не обычная ссылка "Поделиться".

## Как устроено /dota

Точный ММР недоступен в публичном API Dota 2 с 2019 года — доступна
только медаль ранга. Админ в `/admin/dota` добавляет игрока по имени
и Steam ID (принимает Steam64 и Account ID, конвертация автоматическая).
Ранг подтягивается с OpenDota сам, кнопка "Обновить" на `/dota` просит
пересобрать данные конкретного игрока. Если игрок скрыл статистику — ранг
не будет виден, это ограничение самого API.

## Структура проекта

```
src/
  app/
    layout.tsx                     — корневой layout: шрифты, скрипт инициализации темы
    icon.png                       — favicon (герб сервера)
    (site)/                        — публичные страницы, общая шапка
      layout.tsx                   — рендерит SiteHeader
      page.tsx                     — главная-хаб
      awards/
        page.tsx                   — hero + форма кода + FAQ
        vote/page.tsx               — пошаговое голосование
        results/page.tsx            — результаты, сетка карточек-победителей, архив сезонов
      iceberg/page.tsx              — интерактивный айсберг со скролл-эффектом
      history/page.tsx              — главы истории, embed Canva + ScrollReveal
      dota/page.tsx                 — лидерборд рангов Dota 2
    admin/
      login/page.tsx                — вход (первый пароль становится постоянным)
      (protected)/                  — все страницы админки, защищены layout-гардом
        layout.tsx                  — проверка сессии + admin-shell/admin-main
        page.tsx                    — дашборд
        nominations/page.tsx        — CRUD номинаций и номинантов
        codes/page.tsx               — генерация кодов (по количеству / по именам)
        results/page.tsx             — полная раскладка голосов + публикация
        votes/page.tsx               — кто как голосовал
        seasons/page.tsx             — создание нового сезона
        dota/page.tsx                — список игроков Dota 2
    api/
      awards/
        auth/code/route.ts          — POST: проверка кода
        session/route.ts             — GET: активна ли voter-сессия
        vote/route.ts                — POST: сохранение голоса
        results/route.ts             — GET: публичные результаты
      dota/route.ts                  — GET: лидерборд (?force=1)
      dota/refresh/route.ts          — POST: пересборка данных игрока
      admin/
        login/route.ts               — POST: вход/установка пароля
        logout/route.ts              — POST: выход
        seasons/route.ts             — GET/POST сезоны
        nominations/route.ts         — CRUD номинаций
        nominees/route.ts            — CRUD номинантов
        codes/route.ts                — генерация кодов
        results/route.ts              — GET раскладка / PATCH публикация
        votes/route.ts                — кто как голосовал
        upload/route.ts               — загрузка картинок в Storage
        dota/route.ts                 — CRUD игроков Dota
  components/
    SiteHeader.tsx                  — шапка, прячется при скролле
    ThemeToggle.tsx                 — переключатель темы
    ScrollReveal.tsx                — появление контента при скролле
    CodeEntryForm.tsx               — форма ввода кода
    ProgressBar.tsx                 — прогресс-бар голосования
    NominationCard.tsx              — карточка номинации при голосовании
    ResultCard.tsx                  — карточка победителя
    FaqAccordion.tsx                — аккордеон вопрос-ответ
    CanvaEmbed.tsx                  — адаптивный iframe для Canva
    admin/
      AdminNav.tsx                  — навигация админки
      ImagePicker.tsx               — картинка: ссылка или файл
      NominationForm.tsx            — форма создания номинации
      NomineeManager.tsx            — управление номинантами
      CodeGenerator.tsx             — генерация кодов
      StatsCard.tsx                 — карточка метрики
  lib/
    supabase/client.ts              — клиент Supabase для браузера
    supabase/server.ts              — клиент Supabase для сервера
    env.ts                          — валидация переменных окружения
    auth.ts                         — сессии голосующего и админа
    types.ts                        — общие TypeScript-типы
    results.ts                      — подсчёт голосов
    dota.ts                         — OpenDota API, медали, Steam ID
    rate-limit.ts                   — простой in-memory rate-limit
  styles/globals.css                — дизайн-система
supabase/
  schema.sql                        — полная SQL-схема (новый проект, включает dota_players)
  migration_001_swv_sections.sql    — сезоны + разделы SWV
  migration_002_dota.sql            — таблица dota_players
  migration_003_remove_glossary_memes.sql — удаление глоссария/мемов (для старых развёртываний)
public/
  logo.png                          — герб сервера
```

## Переменные окружения

Создай `.env.local` (шаблон — в `.env.local.example`):

| Переменная | Описание |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL из Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable (anon) ключ Supabase |
| `SUPABASE_SECRET_KEY` | service role (secret) ключ Supabase — только на сервере, в клиент не попадает |
| `SESSION_SECRET` | случайная строка для подписи cookie сессий |
| `BOOTSTRAP_ADMIN_PASSWORD` | (необязательно) пароль первого входа в админку — если задан, именно он станет паролем админа |

## Запуск

1. Создать проект на supabase.com
2. SQL Editor → выполнить `supabase/schema.sql` (новый проект). Если проект уже
   разворачивался со старыми разделами — применить `migration_003_remove_glossary_memes.sql`
3. Storage → создать публичный бакет `images`
4. Project Settings → Data API (Project URL) и API Keys
5. Скопировать `.env.local.example` в `.env.local`, вставить ключи + `SESSION_SECRET`
6. `npm install`
7. `npm run dev`
8. Задеплоить на vercel.com, те же переменные окружения — в Vercel Environment Variables
9. Сразу после деплоя зайти на `/admin/login` и установить пароль админки
   (либо задать `BOOTSTRAP_ADMIN_PASSWORD`)

## Статус

Функционально готов целиком: бэкенд, админка, публичная часть, дизайн,
мобильная адаптация, все разделы. Дособирается по мере обратной связи.

**Известные упрощения:**
- Айсберг редактируется напрямую в Supabase, без страницы в админке
- Главы истории добавляются правкой массива в коде, не через админку
