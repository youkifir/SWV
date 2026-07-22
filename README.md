# SWV

Сайт-хаб дискорд-сервера: SWAG Awards (ежегодное голосование за номинации
с архивом по сезонам), глоссарий участников, интерактивный айсберг сервера,
история сервера главами (Canva), локальные мемы, лидерборд рангов Dota 2.

## Стек

- **Next.js** (App Router, TypeScript) — фронтенд + бэкенд (API routes)
- **Supabase** (Postgres + Storage) — база данных и хранилище картинок
- **OpenDota API** — автоматическая подтяжка рангов Dota 2 (без ключа)
- **Vercel** — хостинг и деплой

## Разделы сайта

- `/` — главная-хаб, ссылки на все разделы
- `/awards` — SWAG Awards: hero-блок с формой кода + FAQ → `/awards/vote` голосование → `/awards/results` результаты с архивом по сезонам
- `/glossary` — глоссарий участников + `/glossary/submit` открытая форма предложить участника
- `/iceberg` — интерактивный айсберг: чем ниже листаешь, тем темнее фон и глубже уровень
- `/history` — история сервера главами, встроенные Canva-презентации
- `/memes` — локальные мемы + `/memes/submit` открытая форма добавить мем
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
(`/admin/seasons`), у сезона свои номинации и коды; старые сезоны остаются
архивом на `/awards/results`. Коды выдаются анонимной пачкой либо по списку
имён — тогда в `/admin/votes` видно, кто как проголосовал (анонимные пачки
остаются анонимными). Организатор в `/admin/results` видит полную
раскладку голосов и публикует топ-3 по каждой номинации кнопкой.

## Как устроено наполнение остальных разделов

Основу (глоссарий, мемы) создают админы через `/admin`. Участники сервера
могут предлагать дополнения через открытые формы (`/glossary/submit`,
`/memes/submit`) без регистрации — заявка уходит в очередь на
`/admin/submissions`, публикуется только после одобрения. Открытые формы
принимают картинку только по ссылке, не файлом — загрузка через
`/api/admin/upload` защищена паролем админа специально.

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
Ранг подтягивается с OpenDota сам (кэш 5 минут), кнопка "Обновить" на
`/dota` просит пересобрать данные конкретного игрока. Если игрок скрыл
статистику — ранг не будет виден, это ограничение самого API.

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
      glossary/
        page.tsx                   — список участников (force-dynamic)
        submit/page.tsx             — форма предложить участника/правку
      iceberg/page.tsx              — интерактивный айсберг со скролл-эффектом
      history/page.tsx              — главы истории, embed Canva + ScrollReveal
      memes/
        page.tsx                   — галерея мемов (force-dynamic)
        submit/page.tsx             — форма добавить мем
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
        submissions/page.tsx         — очередь модерации заявок
        seasons/page.tsx             — создание нового сезона
        dota/page.tsx                — список игроков Dota 2
    api/
      awards/
        auth/code/route.ts          — POST: проверка кода
        session/route.ts             — GET: активна ли voter-сессия
        vote/route.ts                — POST: сохранение голоса
        results/route.ts             — GET: публичные результаты
      submissions/route.ts           — POST: открытая отправка заявки
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
        submissions/route.ts          — модерация заявок
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
    auth.ts                         — сессии голосующего и админа
    types.ts                        — общие TypeScript-типы
    results.ts                      — подсчёт голосов
    dota.ts                         — OpenDota API, медали, Steam ID
  styles/globals.css                — дизайн-система
supabase/
  schema.sql                        — полная SQL-схема (новый проект)
  migration_001_swv_sections.sql    — сезоны + разделы SWV
  migration_002_dota.sql            — таблица dota_players
public/
  logo.png                          — герб сервера
```

## Запуск

1. Создать проект на supabase.com
2. SQL Editor → выполнить `supabase/schema.sql` (новый проект), либо по
   очереди `migration_001_swv_sections.sql` и `migration_002_dota.sql`
3. Storage → создать публичный бакет `images`
4. Project Settings → Data API (Project URL) и API Keys
5. Скопировать `.env.local.example` в `.env.local`, вставить ключи + `SESSION_SECRET`
6. `npm install`
7. `npm run dev`
8. Задеплоить на vercel.com, те же переменные окружения — в Vercel Environment Variables

## Статус

Функционально готов целиком: бэкенд, админка, публичная часть, дизайн,
мобильная адаптация, все разделы. Дособирается по мере обратной связи.

**Известные упрощения:**
- Одобрение заявки публикует её как есть, без формы правки в UI
- Открытые формы принимают картинку только по ссылке
- Открытые формы без защиты от спама — приемлемо для закрытого круга друзей
- Айсберг редактируется напрямую в Supabase, без страницы в админке
- Главы истории добавляются правкой массива в коде, не через админку
