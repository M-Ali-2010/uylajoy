# UyJoy — Handoff (журнал для следующего агента)

> Правило: **каждый агент дописывает этот файл** в конце сессии — что сделал, что сломалось,
> какие решения приняты и почему. Новый агент читает его **первым**, затем `docs/AUDIT.md`.
> Формат записи в §4 — дата, что сделано, ловушки, что осталось.

---

## 1. Состояние на 2026-09-20

|                |                                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ветка          | `main`, деплой на Vercel по push (`https://uylajoy.vercel.app`)                                                                                                                                                                                                                                  |
| **Production** | ✅ **работает** (с 2026-09-20): `https://uylajoy.vercel.app/api/health` → все `ok`. База — Supabase `zodcfloutvbwyfkzrhia` (eu-west-1) через pooler `aws-1-eu-west-1.pooler.supabase.com:6543`; функции Vercel в `dub1`. Миграции 3/3, залиты демо-данные (`*@uyjoy.local`, пароль `Passw0rd!`). |
| Локально       | ✅ полностью работает на Postgres 14 (`uyjoy_dev`), `scripts/api-smoke.mjs` — 70/70                                                                                                                                                                                                              |
| Typecheck      | ✅ `npx tsc --noEmit` — 0 ошибок                                                                                                                                                                                                                                                                 |
| Lint           | ✅ 0 ошибок (4 предупреждения `react-refresh` в ui-примитивах — не трогать)                                                                                                                                                                                                                      |
| Тесты          | `scripts/api-smoke.mjs` (end-to-end против живого сервера + БД). Юнит-тестов нет.                                                                                                                                                                                                                |

Что уже сделано по ТЗ (`TZ/`, `docs/AUDIT.md` §7): **P0 полностью, P1 частично** (кабинет, уведомления, фото, состояния loading/empty/error, юридические страницы). Не сделано: карта, SEO-sitemap/slug-URL, жалобы, монетизация UI, локализация внутренних страниц `/ipoteka`, `/narxlar`.

---

## 2. Production — как устроено и как менять

Env на Vercel (Production): `DATABASE_URL` (pooler, см. ниже), `JWT_SECRET`, `ADMIN_EMAILS`, `APP_URL`, `CLOUDINARY_*`, `SUPABASE_*` (последние три не используются кодом — оставлены на будущее).

- **Строка подключения** — только Transaction pooler, с префиксом `aws-1`:
  `postgresql://postgres.zodcfloutvbwyfkzrhia:<пароль>@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`
  Прямой хост `db.<ref>.supabase.co` — IPv6-only, с Vercel недоступен. Пароль базы менять в Supabase → Project Settings → Database; после смены: `printf '%s' '<url>' | vercel env add DATABASE_URL production --force` и `vercel redeploy <последний prod-деплой>` (env подхватывается только новым деплоем).
- **Новая миграция:** `npx drizzle-kit generate` → файл в `drizzle/` + запись в `meta/_journal.json` → применить `DATABASE_URL='<url>' node scripts/setup-db.mjs` (или `npx drizzle-kit migrate`). Скрипт идемпотентен и знает про уже применённые.
- **Первый админ:** любой email из `ADMIN_EMAILS` получает роль admin при регистрации или входе. Сейчас там email владельца.
- **Демо-данные удалить:** `delete from users where email like '%@uyjoy.local'` (каскадом уйдут их объявления).
- **Проверка после любого деплоя:** `curl https://uylajoy.vercel.app/api/health`.

---

## 3. Архитектура — краткая карта

```
src/routes/api/**          HTTP API. Формат: createFileRoute("/api/x")({ server: { handlers: { GET, POST } } })
                           (НЕ createAPIFileRoute — он удалён из TanStack Start ≥1.121, файлы молча выпадают из роутинга)
src/lib/server/*           бизнес-логика: auth, properties (машина статусов), leads, favorites, notifications,
                           viewing-requests, analytics, upload (Cloudinary), payments (Payme/Click), rate-limit,
                           validation (телефон E.164, парольная политика), http (errorResponse/readJson/clampInt), errors (AppError)
src/db/drizzle-schema.ts   схема; drizzle/*.sql — миграции (0000 база, 0001 индексы+admin_actions+verification, 0002 viewing_requests+analytics_events)
src/lib/api-client.ts      единственный fetch-клиент (ApiError с code/fields); src/lib/queries.ts — все react-query хуки
src/lib/listing.ts         словарь UI (kvartira/hovli/sotuv/ijara) ↔ API (apartment/house/sale/rent) + адаптер toListing()
src/lib/api-error-text.ts  код ошибки → локализованная фраза (t.errors.*)
src/i18n/translations/     uz = источник типов; ru/en обязаны иметь те же ключи (tsc ловит)
src/components/uyjoy/      home/* (главная), property/* (галерея, контакт), dashboard/* (кабинет), admin/* (обзор),
                           auth/* (layout, password-input), states.tsx (skeleton/empty/error), require-auth.tsx, setup-banner.tsx
scripts/api-smoke.mjs      e2e-тест;  scripts/setup-db.mjs — миграции+админ;  scripts/seed.mjs — демо-данные
```

Ключевые инварианты:

- **Публично видны только `status = active`.** Владелец видит свои в любом статусе (`?mine=1`), админ — любые.
- **Владелец не может выставить `active`.** Переходы владельца — `OWNER_TRANSITIONS` в `properties.ts`; правка опубликованного → снова `pending`. `active` ставит только админ через `/api/admin/properties` (пишется в `admin_actions`).
- **Телефон владельца не попадает в публичный JSON/HTML.** Только `POST /api/properties/:id/contact` (rate limit, событие `contact_click`).
- **Роль `admin` нельзя получить регистрацией.** Только `ADMIN_EMAILS` (env) или `scripts/setup-db.mjs`.
- Ошибки клиенту — только `AppError`; всё остальное логируется и превращается в `internal` (500) или `db_unavailable` (503).

---

## 4. Журнал сессий

### 2026-09-14 · сессия 1 — редизайн главной + аудит

- Полный редизайн presentation layer (дизайн-система в `styles.css`, компоненты `home/*`, `PropertyCard`).
- **Найдено и исправлено:** `Button asChild` терял все классы (Radix `Slot` получал Fragment) — все link-CTA сайта рендерились голым текстом.
- Аудит → `docs/AUDIT.md`. Главное: API-слой не был задеплоен вообще (все 17 файлов на удалённом `createAPIFileRoute`), БД не существует, весь фронт на mock-данных, `/admin` без авторизации.

### 2026-09-15 · сессия 2 — P0 (backend, безопасность, core flows)

- Все API-файлы переведены на `server.handlers`; guard'ы `/admin`, `/dashboard`; `.env` в gitignore; fail-fast без `JWT_SECRET`/`DATABASE_URL`.
- Машина статусов, публичный/приватный DTO, rate limits, валидация фото (magic bytes), `ilike` + индексы (миграция 0001).
- Фронт на react-query, статические данные удалены; кабинет, админка (модерация/объявления/пользователи), заявки, просмотры, аналитика (0002).
- **Ловушка:** `src/data/listings.ts` был удалён — импорты из него больше не существуют, используйте `src/lib/listing.ts`.

### 2026-09-15…17 · сессия 3 (другая сессия Claude, коммиты `99de09d`, `11eb522`, `477dc74`)

- Уведомления (inbox `/dashboard/bildirishnomalar`, колокольчик в шапке), auth-aware header, `payments.ts` типизирован — tsc чист.
- Поиск по городу исправлен; отсутствующий Cloudinary даёт понятную ошибку.
- Pooler Supabase: `prepare: false` + `max: 3` для `*.pooler.supabase.com` / `:6543`.

### 2026-09-20 · сессия 4 — регистрация «до максимума», админ-обзор, документация

Симптом от владельца: «регистрация не работает». Причина — не код, а **прод без базы** (см. §1/§2). Локально регистрация работала, но UX был слабый. Сделано:

- **Коды ошибок end-to-end:** `AppError.code` → `errorResponse` → `ApiError` на клиенте → `describeApiError()` даёт фразу на языке пользователя (`t.errors.*`). Коды: `validation` (+ `details.<field>`), `email_taken`, `bad_credentials`, `account_blocked`, `rate_limited`, `db_unavailable`, `network`, `unauthorized`.
- **Недоступная БД = 503 `db_unavailable`**, а не «Registration failed» 500. `isDatabaseDown()` разворачивает `cause` (drizzle оборачивает ошибку драйвера в «Failed query…»).
- **Парольная политика** одна на сервер и форму: `passwordSchema` (≥8, буква, цифра). Старая форма обещала «заглавную букву», сервер этого не проверял.
- Регистрация: выбор роли (ищу / владелец / агент), `?redirect=`, inline-ошибки полей, честные ссылки на `/shartlar` и `/maxfiylik` (страницы созданы, uz/ru/en). Удалена кнопка «Войти через Google», которая ничего не делала.
- Вход: после входа admin → `/admin`, seller/agent → `/dashboard`, buyer → `/`.
- **`ADMIN_EMAILS`** (env, через запятую): совпавший email становится admin при регистрации **и при входе** → первого админа на проде можно получить без SQL.
- `GET /api/health` (env, jwt, cloudinary, database: ok / not migrated / unreachable(code)); `SetupBanner` в `__root.tsx` показывает проблему прямо на сайте.
- `scripts/setup-db.mjs` — миграции по journal drizzle + первый админ, идемпотентно (savepoint на statement, чтобы «already exists» не валил транзакцию).
- Админка: вкладка **Обзор** — счётчики (модерация/активные/пользователи/заявки/просмотры), активность за 7 дней по `analytics_events`, журнал `admin_actions`, новые пользователи. `GET /api/admin/stats`.
- Лимит регистрации поднят 5 → 10 в час на IP (при тестировании 5 упирались быстро и выглядели как «не работает»).

**Ловушки, на которых потерял время (не повторять):**

1. **Правки через `str.replace()` без `assert`** молча не применяются, если prettier уже переформатировал файл. Всегда `assert old in s`. Из-за этого дважды тестировал старый код.
2. **В raw `sql\`\``drizzle не сериализует`Date`** для postgres-js → `ERR_INVALID_ARG_TYPE`. Передавать `date.toISOString()`и кастовать`::timestamp`.
3. **postgres.js `sql.begin()` перебрасывает первую ошибку внутри транзакции даже если её поймали.** Для «пропустить statement» использовать `tx.savepoint(fn)`, а не ручной `savepoint/rollback`.
4. Колонки `timestamp` без TZ + `defaultNow()` = локальное время сервера, а JS читает как UTC → на машине в UTC+5 «через 5 часов». Исправлено `connection: { TimeZone: "UTC" }` в `db/index.ts`. Правильнее — миграция на `timestamptz`, отложено.
5. Консоль браузера в панели предпросмотра **накапливает историю**; ошибки `useLanguage must be used within a LanguageProvider` после правок `i18n/*` — артефакт HMR, на свежей загрузке их нет. Проверять count до/после `navigate`.
6. `vercel link` перезаписывает `.env.local` (дописывает `VERCEL_OIDC_TOKEN`) и трогает `.gitignore`. Локальный `DATABASE_URL` остаётся, но проверьте после.
7. Локально dev использует `.env.local` (localhost Postgres), а `.env` содержит мёртвый Supabase-URL — не пугаться, `.env` на дев не влияет, пока есть `.env.local`.

### 2026-09-20 · сессия 4b — доступ к Supabase получен, диагноз уточнён

- Через Management API выяснилось: **проект не удалён**, ACTIVE_HEALTHY в eu-west-1. Вывод аудита C2 «проект удалён» был неверен — ENOTFOUND потому, что `db.<ref>.supabase.co` резолвится только в IPv6.
- Pooler проекта: `aws-1-eu-west-1.pooler.supabase.com:6543`, user `postgres.zodcfloutvbwyfkzrhia` (из `GET /v1/projects/{ref}/config/database/pooler`). Прод отвечал XX000 → на Vercel почти наверняка стоял `aws-0-…` или чужой ref.
- Пароль из локального `.env` не подходит (28P01). `PATCH /v1/projects/{ref}/database/password` заблокирован политикой auto-mode как secret-store write → нужен владелец (§2).
- Сделано без пароля: `ADMIN_EMAILS`, `APP_URL` в Vercel; `regions: ["dub1"]` в `vercel.json`.
- **Ловушка 8:** `vercel env pull` отдаёт `[SENSITIVE]` вместо значений Secret-переменных — прочитать прод-`DATABASE_URL` нельзя, только заменить.
- **Ловушка 9:** `dig host A` и `dig host AAAA` отдельно; Supabase direct-host без IPv4-аддона недоступен из IPv4-сетей — всегда pooler.
- **Ловушка 10 (моя, дважды за день):** цепочка `python3 …; git commit; git push` через `;` — python упал, а коммит ушёл без правок. Использовать `&&` и `assert` на каждую замену.

### 2026-09-20 · сессия 4c — прод запущен

- Владелец сбросил пароль БД и передал его; агент прописал `DATABASE_URL` (`vercel env add --force`), подтвердил миграции (`setup-db.mjs`: 3/3 уже были применены — другая сессия успела), залил `seed.mjs`, сделал `vercel redeploy`.
- Проверено на проде: `/api/health` все ok, `/api/properties/stats` = 8 активных, вход seed-пользователем, регистрация через UI (пробный аккаунт удалён), баннер «сервер не настроен» исчез.
- **Ловушка 11:** `vercel env add` без `--force` на существующей переменной молча печатает подсказку и ничего не меняет — проверять по `✓ Overrode` в выводе.
- **Ловушка 12:** `vercel redeploy` нужен явно: смена env не передеплоивает.

**Что дальше (по приоритету):**

- [x] Прод запущен (2026-09-20).
- [ ] Владелец: отозвать Supabase access token `uyjoy-setup` (передавался агенту в чате) и сменить пароль БД, если он тоже был в чате.
- [ ] Локализовать `/ipoteka`, `/narxlar` (хардкод uz), убрать статический массив `market` в `/narxlar` — считать из `properties` (`market_statistics` пока никем не наполняется).
- [ ] Миграция 0003: все `timestamp` → `timestamptz`; unique `(reviewer_id, target_type, target_id)` для `reviews`.
- [ ] SEO: sitemap.xml (активные объявления), canonical, slug в URL (`/elonlar/<slug>-<id>`), og:image абсолютный уже есть.
- [ ] Жалобы (`reports` таблица + вкладка в админке), редактирование объявления в кабинете (сейчас только статусы/удаление).
- [ ] Юнит-тесты для `properties.ts` (машина статусов) и `validation.ts`; vitest ещё не подключён.
- [ ] Токен в `localStorage` → httpOnly cookie (см. AUDIT H9).
