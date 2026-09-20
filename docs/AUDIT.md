# UyJoy.uz — Технический аудит (Этап 0 по ТЗ «Production Upgrade»)

> Актуальное состояние и журнал работ — в `docs/HANDOFF.md`. Этот файл — снимок на момент аудита.

Дата: 2026-09-14 · Основа: репозиторий `uylajoy-main` (ветка `main`, коммит `efba794`) + https://uylajoy.vercel.app

Метод: чтение исходников backend/frontend, сборка проекта, запросы к локальному и production API, попытка подключения к БД по `DATABASE_URL`, проверка страниц в браузере.

---

## 1. Архитектура как есть

| Слой        | Фактическая реализация                                                                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend    | TanStack Start 1.168 (React 19, Vite 8, Tailwind v4), file-based routing, SSR через Nitro → Vercel                                                                                                     |
| State       | `zustand` только для auth (`src/lib/auth-store.ts`). `@tanstack/react-query` подключён в `__root.tsx`, но **ни один компонент его не использует**                                                      |
| Backend     | **Не Supabase Auth / RLS / PostgREST.** Собственный Node-backend внутри TanStack Start: Drizzle ORM + драйвер `postgres` напрямую по `DATABASE_URL`. Supabase используется только как хостинг Postgres |
| Auth        | Собственная: bcrypt + JWT + таблица `sessions`, токен в `localStorage` (`Authorization: Bearer`)                                                                                                       |
| Файлы       | Cloudinary (`src/lib/server/upload.ts`), base64 через JSON                                                                                                                                             |
| Уведомления | Таблица `notifications` + Telegram-бот                                                                                                                                                                 |
| Платежи     | Payme (JSON-RPC, Basic auth проверяется) и Click (md5-подпись проверяется)                                                                                                                             |
| Схема БД    | 14 таблиц в `src/db/drizzle-schema.ts`; миграция `drizzle/0000_*.sql`                                                                                                                                  |

Страницы: `/`, `/elonlar`, `/elonlar/$id`, `/elon-joylash`, `/ipoteka`, `/narxlar`, `/sevimlilar`, `/kirish`, `/royxatdan-otish`, `/dashboard`, `/admin`.
API-файлы: 17 штук в `src/routes/api/**`.

### Схема БД vs §3.1 ТЗ

Есть: `users`, `sessions`, `agencies`, `agents`, `properties`, `property_images` (отдельная таблица — правильно), `favorites`, `favorite_folders`, `leads`, `reviews`, `notifications`, `price_history`, `payments`, `market_statistics`.

Нет: запросы на просмотр, жалобы, лог admin-действий, `verification_status / verified_by / verified_at`, раздельные `moderation_status` и `publication_status` (сейчас один enum `status`), координаты есть, но карта не реализована. У `reviews` нет уникальности (reviewer, target) — повторные отзывы возможны.

---

## 2. Critical

### C1. Весь API-слой не задеплоен — ни один endpoint не работает

Все 17 файлов используют `createAPIFileRoute` из `@tanstack/react-start/api`. Такого модуля в установленной версии 1.168 нет (актуальный API — `createFileRoute(...)({ server: { handlers: { GET, POST } } })`). Сборка предупреждает по каждому файлу: _«does not export a Route. This file will not be included in the route tree»_, в `routeTree.gen.ts` нет ни одного `/api/*`.

Проверено: `GET /api/properties`, `/api/properties/featured`, `/api/payments/pricing`, `POST /api/auth/login` → **404** локально и на production.
Следствие: страницы входа/регистрации не работают; ничего на сайте не обращается к БД.

### C2. База данных недоступна

Хост `db.zodcfloutvbwyfkzrhia.supabase.co` и REST-хост проекта **не резолвятся в DNS** (проект удалён/остановлен либо ref неверный; сеть исправна — `supabase.com`, `vercel.app` резолвятся). Нет свидетельств, что миграция когда-либо применялась. В миграции **0 индексов** и **RLS не включён ни на одной таблице** (пока API идёт через `DATABASE_URL` это не дыра, но при любом использовании anon-ключа/PostgREST таблица `users` с `password_hash` будет открыта).

### C3. Frontend полностью на mock-данных

`src/data/listings.ts` (8 записей) питает главную, `/elonlar`, `/elonlar/$id`, `/sevimlilar`. `/dashboard` и `/admin` — захардкоженные объекты (`dashboard/index.tsx:40-56`, `admin/index.tsx:50-58`). `/elon-joylash` показывает toast «принято» и ничего не отправляет (`elon-joylash.tsx:55-57`). Избранное — локальный `useState` в карточке. `/narxlar` — статический массив. Newsletter — только toast.

### C4. `/admin` и `/dashboard` без авторизации

На production оба отвечают **200** любому посетителю и рендерят фейковую очередь модерации с именами людей. Под-маршрутов `/admin/elonlar`, `/dashboard/elonlarim` и т. д. не существует (→ 404).

### C5. Обход модерации и утечка неопубликованного (в коде API)

- `PATCH /api/properties/:id` принимает `status: "active"` (`routes/api/properties/$id.ts:27`) — владелец сам публикует объявление.
- `GET /api/properties?status=draft|pending|rejected` (`routes/api/properties/index.ts:19`) отдаёт анониму чужие черновики и отклонённые.
- `UpdatePropertyInput` (`lib/server/properties.ts`) содержит `isFeatured / isPremium / featuredUntil / premiumUntil` — платные флаги; zod сейчас их не пропускает, но сервис-слой не защищён.

### C6. Секреты

- `.env` с реальными `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` **не в `.gitignore`** (видна как untracked — одно `git add .` до утечки в репозиторий).
- `JWT_SECRET` при отсутствии переменной падает на захардкоженную строку (`lib/server/auth.ts:8`) — сервер должен отказываться стартовать.

### C7. Приватные данные в публичном ответе / IDOR

`getPropertyById` (`lib/server/properties.ts:268`) возвращает `owner.phone` любому (строки 276, 312) и не проверяет `status` — черновик/отклонённое объявление читается по id кем угодно. ТЗ §3.3/§6 требует отделить публичный DTO от приватного и отдавать контакт только через действие.

---

## 3. High

- **H1.** `validateSession` проверяет `isVerified`, но не `isActive` (`auth.ts:104` vs `:202`) — заблокированный пользователь сохраняет доступ до истечения 7-дневной сессии.
- **H2.** Нет rate limiting нигде: login, register, создание лида, upload.
- **H3.** Upload: base64 в JSON, до 20 изображений за запрос, серверная проверка только «строка не пустая» (`routes/api/upload.ts:8`) — ни размера, ни MIME.
- **H4.** Поиск: `like` (регистрозависимый в Postgres) по title/description/address (`properties.ts:186-188`), `%`/`_` не экранируются; индексов по `city/district/type/deal_type/status/price/created_at` нет.
- **H5.** Телефон — любая строка ≥ 9 символов; email — только `z.string().email()`; нормализации нет.
- **H6.** Нет машины статусов: редактирование не возвращает на модерацию (§4), `approveProperty` не проверяет текущий статус, `verification_status` отсутствует (§10).
- **H7.** Нет loading / empty / error states и единого data layer — потому что ничего не загружается.
- **H8.** `page/limit` и `featured?limit=` не ограничены сверху — можно запросить всю таблицу.
- **H9.** Токен в `localStorage` — уязвим к XSS; предпочтителен httpOnly cookie.
- **H10.** `POST /api/properties` принимает произвольные `agentId/agencyId` (`index.ts:57-58`) — объявление можно приписать любому агенту.
- **H11.** Несовместимые контракты frontend ↔ backend: id `"tsh-101"` vs UUID; словарь `kvartira/hovli/sotuv/ijara` vs `apartment/house/sale/rent`; `/elonlar/$id` и `api-client.ts` не стыкуются без адаптера.

## 4. Medium

- **M1.** Дубли: два API-клиента (`src/api/index.ts` — не импортируется нигде; `src/lib/api-client.ts`), две схемы (`src/db/schema.ts` типы vs `drizzle-schema.ts`).
- **M2.** Мёртвый код: `src/lib/supabase.ts` (нигде не импортируется; содержит фабрику service-role клиента — если оставлять, только server-only), `ui/animated.tsx`, `ui/image-gallery.tsx`, `lib/animations.ts`.
- **M3.** TypeScript: 130 ошибок, все в `lib/server/*` и `db/*` (`noPropertyAccessFromIndexSignature`, possibly-undefined). Сборка проходит только потому, что Vite не типизирует. ESLint: 290 prettier-ошибок в нетронутых файлах.
- **M4.** Внутренние страницы хардкодят узбекский текст → смешение языков при RU/EN (главная исправлена).
- **M5.** SEO: нет sitemap, canonical, og:image; URL объектов — непрозрачные id, а не slug (§14).
- **M6.** Платёжные обработчики выглядят корректно (подписи проверяются), но не тестировались; не трогать до определения бизнес-модели (§17).
- **M7.** Telegram-шаблон лида отправляет телефон покупателя — допустимо только владельцу объекта; убедиться в адресате.
- **M8.** Тестов и CI нет (§19 требует базовые тесты).
- **M9.** `reviews`: нет unique (reviewer_id, target_type, target_id).
- **M10.** `market_statistics` никем не рассчитывается; `/narxlar` показывает выдуманные цифры.

## 5. Low

- Полнотекстовый поиск вместо `like` по description — позже.
- Шрифты с Google Fonts — при желании self-host.
- `console.error` в root ErrorComponent.

---

## 6. KEEP / FIX / REFACTOR / REMOVE

**KEEP** (работает правильно, переиспользовать):
Drizzle-схема и relations; auth-сервис (bcrypt, сессии, JWT) — с правками ниже; `leads.ts` (проверки владения корректны); `favorites.ts`; проверка роли admin в `api/admin/properties.ts`; обработчики Payme/Click; Cloudinary-сервис; i18n; дизайн-система, компоненты главной и `PropertyCard`; SSR-обвязка (`server.ts`, `start.ts`).

**FIX** (точечно):
C1 регистрация API-маршрутов · C2 БД + индексы · C6 `.gitignore` + fail-fast на `JWT_SECRET` · C4 guard'ы `/admin`, `/dashboard` · C5/C7 whitelist полей и публичный/приватный DTO · H1 `isActive` в сессии · H2 rate limiting · H3 валидация upload · H4 `ilike` + экранирование + индексы · H8 cap на `limit` · H10 whitelist `agentId`.

**REFACTOR**:
Frontend на реальный data layer (react-query уже установлен) вместо `data/listings.ts`; единый словарь id/типов (H11) с адаптером; `/dashboard`, `/admin`, `/sevimlilar`, `/elon-joylash` с mock на API; машина статусов + повторная модерация при редактировании (H6); разделение DTO.

**REMOVE**:
`src/api/index.ts`, `src/db/schema.ts` (дубликат типов), `src/lib/supabase.ts` (или строго server-only), `ui/animated.tsx`, `ui/image-gallery.tsx`, `lib/animations.ts`, mock-массивы в dashboard/admin/sevimlilar/narxlar после подключения API.

---

## 7. Порядок работ (по §18 / §21 ТЗ)

**P0-a — разблокировать (без этого дальше нельзя):**

1. Рабочий Supabase-проект (восстановить или новый), применить миграцию, добавить индексы.
2. Перевести 17 API-файлов на `server.handlers` актуального TanStack Start; проверить каждый endpoint.
3. `.env` → `.gitignore`; отказ старта без `JWT_SECRET`/`DATABASE_URL`.
4. Guard'ы на `/admin` (role=admin) и `/dashboard` (auth).

**P0-b — безопасность:** C5, C7, H1, H2, H3, H8, H10; удалить `status`/платные флаги из клиентского whitelist; отдельный admin-endpoint для смены статуса с логом действия.

**P0-c — core flows:** `/elon-joylash` → `POST /api/properties` (пошагово, фото, preview); `/elonlar` → `GET` с backend-фильтрами и пагинацией; `/elonlar/$id` → `GET` + «Оставить заявку» / «Запросить просмотр» (новая таблица `viewing_requests`); очередь модерации в `/admin` с причиной отказа; избранное через API.

**P1:** кабинет (мои объявления, черновики, заявки, уведомления), загрузка фото в UI, loading/empty/error через react-query, мобильный проход, локализация внутренних страниц.

**P2:** SEO (sitemap, canonical, og:image, slug-URL), таблица событий аналитики (§16), UI уведомлений, жалобы, карта.

**P3:** монетизация (UI поверх уже существующих `payments`).

---

## 8. Статус P0 (обновлено 2026-09-14)

Проверено на локальном PostgreSQL 14 (`.env.local` → `uyjoy_dev`), сквозной тест `scripts/api-smoke.mjs` — **35/35**.

| # | Что | Статус |
|---|---|---|
| C1 | 17 API-файлов переведены на `createFileRoute(...)({ server: { handlers } })`; все `/api/*` в route tree, отвечают | ✅ |
| C2 | Миграция `drizzle/0001_hardening.sql`: 18 индексов, `admin_actions`, `verification_status/verified_by/verified_at`, unique на favorites и reviews. Применена локально; **Supabase — ждёт доступа** | ✅ / ⏳ |
| C4 | `RequireAuth` на `/admin` (role=admin) и `/dashboard`; `AuthBootstrap` в root; `/kirish?redirect=` | ✅ |
| C5 | Публичный список — только `active`; свои через `mine=1`; владелец не может выставить `active`; машина статусов в `updateProperty`; правка опубликованного → `pending` | ✅ |
| C6 | `.env` в `.gitignore`; сервер не стартует без `JWT_SECRET` (≥32) и `DATABASE_URL` | ✅ |
| C7 | Неопубликованное по id → 404 для чужих; `owner.phone` вырезается из публичного DTO | ✅ |
| H1 | `validateSession` проверяет `isActive`, сессии заблокированного удаляются | ✅ |
| H2 | Rate limiting (in-memory): login по IP и по аккаунту, register, лиды, upload, создание объявлений | ✅ |
| H3 | Upload: allowlist JPEG/PNG/WebP, magic bytes, ≤ 8 MB, ≤ 20 за запрос, папка — enum | ✅ |
| H4 | `ilike` + экранирование, индексы | ✅ |
| H5 | Телефон → E.164 (`lib/server/validation.ts`), email нормализуется | ✅ |
| H8 | `limit` ≤ 50, featured ≤ 24 | ✅ |
| H10 | `agentId/agencyId` больше не принимаются от клиента; агент привязывается по своему профилю | ✅ |
| — | Ошибки БД не утекают в ответ (`AppError` + `errorResponse`) | ✅ |
| — | Лог admin-действий пишется при approve/reject/archive | ✅ |
| M2 | `src/lib/supabase.ts` удалён | ✅ |

Не тронуто намеренно: `lib/server/payments.ts` (§17 — до бизнес-модели), mock-данные на страницах (P0-c), `api/index.ts` дубликат (уйдёт вместе с data layer).

## 9. Статус P1 (обновлено 2026-09-15)

Проверено на локальном PostgreSQL 16, сквозной тест `scripts/api-smoke.mjs` — **61/61**, `tsc --noEmit` — **0 ошибок**, сборка проходит. UI проверен в Chromium на трёх языках и на мобильной ширине (390px).

| # | Что | Статус |
|---|---|---|
| — | **Уведомления в кабинете**: страница `/dashboard/bildirishnomalar` (список, фильтр «непрочитанные», отметить одно/все прочитанным, удалить, loading/empty/error) | ✅ |
| — | Колокольчик со счётчиком непрочитанных в шапке сайта и в сайдбаре кабинета; счётчик обновляется каждые 2 минуты и при фокусе вкладки | ✅ |
| — | `/api/notifications` приведён к общим конвенциям: `errorResponse`/`AppError`, `clampInt` (limit ≤ 50), публичный DTO без `userId`, валидация id | ✅ |
| — | Чужое уведомление больше не «успешно» отмечается прочитанным/удаляется — теперь 404 (раньше запрос молча проходил, ничего не меняя) | ✅ |
| — | **Локализация уведомлений**: текст собирается на клиенте из `type` + `data` в языке читателя; для строк, записанных до этого, остаётся сохранённый текст | ✅ |
| — | Шапка учитывает авторизацию: меню профиля (кабинет, мои объявления, избранное, настройки, админка для admin, выход) вместо постоянной иконки «Войти»; то же в мобильном меню | ✅ |
| M3 | TypeScript: 130 → **0** ошибок (последние 14 в `lib/server/payments.ts`: доступ по индексной сигнатуре, проверка результата `insert().returning()`) | ✅ |
| M4 | Внутренние страницы локализованы; добавлен `i18n/format.ts` — подстановка `{placeholder}` и относительное время | ✅ |
| — | `bun.lock` был рассинхронизирован с `package.json` (не содержал drizzle, bcryptjs, jsonwebtoken, cloudinary, supabase-js) — обновлён | ✅ |

**Замечание про `Intl` и узбекский.** Chromium возвращает `uz` из `supportedLocalesOf`, но форматирует его данными root-локали: `RelativeTimeFormat("uz-UZ").format(-8, "minute")` → `-8 min`, дата → `2026 M09 17`, число → `96,000`. Узбекский — язык сайта по умолчанию, то есть ломалась бы самая заметная локаль, и определить это через `supportedLocalesOf` нельзя. Поэтому узбекские формулировки времени и дат заданы явно в `src/i18n/format.ts`; для `ru`/`en` по-прежнему используется `Intl`.

Осталось из P1: полноценный мобильный проход по всем страницам (проверены главная, `/elonlar`, кабинет), загрузка фото в UI сделана в P0-c.

## 10. Блокер для деплоя

`DATABASE_URL` в `.env` указывает на несуществующий хост. Нужен восстановленный проект `zodcfloutvbwyfkzrhia` или новый Supabase-проект; затем `npx drizzle-kit migrate` применит обе миграции.
