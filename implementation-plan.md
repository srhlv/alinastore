# Реалізація — alina Art Store (20 кроків)

> Кожен з 20 кроків розбито на деталізовані підкроки.  
> Кожна підкрока = окрема одиниця яка виконується послідовно.
>
> **Джерела правди:** `requirements.md` (функціонал), `architecture.md` (технічна архітектура), `architecture-decisions.md` (зафіксовані рішення). При розбіжності — пріоритет у architecture + decisions.

---

## Фаза 1: Foundation / Підготовка проєкту (кроки 1–3)

### Крок 0: Прототип — Візуальний макет ✅
1. Створити `prototype/` папку в корені репозиторію
2. Написати `index.html` з базовою структурою: header, gallery grid, footer
3. Додати `styles.css` — black & white minimalist style (чорний текст на білому фоні)
4. Створити 3–5 placeholder-карток artwork з тестовими фото та назвами
5. Переглянути макет у браузері на мобільному + десктопі
6. Отримати затвердження від клієнта — тільки після цього переходити до Angular
7. Прототип залишається як референс для дизайну; опційно — preview на GitHub Pages (не production)

### Крок 1: Ініціалізація репозиторію та проекту ✅
1. Створити пустий Git-репо на GitHub/GitLab з назвою `alina-store`
2. Клонувати репо локально, створити структуру монорепо: папки `frontend/`, `backend/`, README.md
3. Встановити Angular CLI глобально (`npm i -g @angular/cli`)
4. Створити фронтенд-проект з флагами `--standalone=true`, `--strict=true`
5. Створити backend проект через `nest new backend`, встановити Prisma залежності
6. Додати root `.gitignore` (node_modules, dist, .env), root `package.json` з convenience-скриптами (`dev:frontend`, `dev:backend`)
7. Створити `.env.example` (root) та `backend/.env.example` — DB URL, BOT TOKEN, JWT SECRET, ADMIN credentials

### Крок 2: Створення БД та Prisma міграцій ✅
1. В `backend/` створити папку `prisma/` + файл `schema.prisma`
2. Описати модель `AdminUser`: id (cuid), username (unique), password, createdAt
3. Описати модель `Artwork`: id, titleUk, titleEn, descriptionUk?, descriptionEn?, status enum (AVAILABLE/SOLD/DELETED), createdAt, updatedAt
4. Описати модель `Option`: id, nameUk, nameEn, descriptionUk?, descriptionEn?, price, artworkId (many-to-one → Artwork)
5. Описати модель `Photo`: id, url, isMain, sortOrder, artworkId (max 5 photos per artwork — валідація в сервісі)
6. Описати модель `Order`: id, customerName, contactInfo, status enum (NEW/CONTACTED/DONE), total, cartJson?, createdAt, updatedAt
7. Описати модель `OrderItem`: id, orderId, artworkId, artworkTitle, optionName, optionPrice, quantity
8. Запустити міграцію: `cd backend && npx prisma migrate dev --name init` (або `migrate deploy` для Supabase remote)
9. Перевірити створену БД через `npx prisma studio` — переконатися що всі таблиці присутні

> **DB:** production/dev — Supabase PostgreSQL (`architecture-decisions` #5). SQLite не використовується.

### Крок 3: Базова структура NestJS + Angular ✅
1. В `backend/src/app.module.ts` підключити пусті placeholder модулі: `AdminAuthModule` (`admin-auth/`), `ArtworksModule`, `OrdersModule`, `UploadModule`
2. У `backend/src/main.ts` додати глобальний `ValidationPipe` (`whitelist: true, transform: true`) та префікс `/api`
3. Встановити додаткові NestJS пакети: `@nestjs/swagger`, `class-validator`, `class-transformer`, `bcryptjs`, `jsonwebtoken`
4. Створити базовий Angular `AppComponent` з простою заголовком "alina art" як плейсхолдер
5. Додати глобальні CSS-змінні в `styles.css` (кольори з прототипу) — **тимчасово**; на кроці 11 підключити **Tailwind CSS** (`architecture-decisions` #6)

---

## Фаза 2: Backend — CRUD для каталогу та замовлень (кроки 4–7)

### Крок 4: Реалізація `AdminAuthModule` — логін та JWT ✅
1. Створити `admin-auth.service.ts`: метод `validateUser(username, password)` — Prisma query + `bcrypt.compare()`
2. Додати `generateToken(payload)`: JWT з `JWT_SECRET`, expiry 7 днів
3. Створити Controller `POST /api/admin/login` — `{ username, password }` → `{ accessToken }`
4. Створити `admin-seed.ts` скрипт: перший адмін через `bcrypt.hash()` + `ADMIN_USERNAME`/`ADMIN_PASSWORD` з `.env` — запускати однократно вручну
5. Протестувати: правильні credentials → 200 + token; неправильні → 401

### Крок 5: JWT Guard та захист роутів адмінки
1. Створити `JwtAuthGuard`: парсить `Authorization: Bearer <token>`, `jwt.verify()` з `JWT_SECRET`, 401 якщо невалідний ✅
2. Додати `@UseGuards(JwtAuthGuard)` на всі admin endpoints (artworks, orders, upload) — **крім** `POST /api/admin/login` ✅
3. На Angular: `AdminAuthService` — зберігає токен у `localStorage.token` після логіну ✅
4. Створити `JwtHttpInterceptor`: додає `Authorization: Bearer <token>` **лише для запитів на `/api/admin/*`** (не для public storefront) ✅
5. Протестувати: без токена → 401; з токеном → success ✅

### Крок 6: `ArtworksModule` — CRUD для каталогу (адмінка)
1. Створити `CreateArtworkDto`: `titleUk`, `titleEn`, `descriptionUk?`, `descriptionEn?`, `options: [{ nameUk, nameEn, descriptionUk?, descriptionEn?, price }]` ✅
2. Створити `UpdateArtworkDto`: ті ж поля, усі `@IsOptional()` ✅
3. `GET /api/admin/artworks` — всі artwork (включно з `DELETED`) + photos + options ✅
4. `POST /api/admin/artworks` — створення Artwork + nested Options ✅
5. `PUT /api/admin/artworks/:id` — оновлення title/description (Uk/En); повна підміна options (delete old → insert new) ✅
6. `DELETE /api/admin/artworks/:id` — soft delete (`status = DELETED`) ✅
7. `PATCH /api/admin/artworks/:id/status` — `{ status: 'AVAILABLE' | 'SOLD' | 'DELETED' }` ✅
8. `POST /api/admin/artworks/:id/photos` — додати фото (макс. 5, валідація в сервісі) ✅
9. `DELETE /api/admin/artworks/:id/photos/:photoId` — видалити фото ✅
10. `PATCH /api/admin/artworks/:id/photos/:photoId` — оновити `isMain`, `sortOrder` ✅

### Крок 6b: `UploadModule` — завантаження фото в Supabase Storage
1. `UploadModule` + `UploadService`: `multipart/form-data` → Supabase Storage через backend proxy ✅
2. `POST /api/admin/upload` (JWT) → `{ url }` для збереження в `Photo` ✅
3. Протестувати: upload → URL → `POST /api/admin/artworks/:id/photos` ✅

### Крок 7: `TelegramService` — сповіщення про замовлення
1. Встановити `node-telegram-bot-api` (`architecture-decisions` #3) ✅
2. Створити `TelegramService`: `sendOrderNotification(order)` — readable message + `bot.sendMessage(chatId, text)` ✅
3. `.env`: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` ✅
4. Експортувати сервіс з `OrdersModule` (provider) — готовий до виклику на кроці 8 ✅
5. Протестувати ізольовано: mock order → повідомлення в Telegram ✅

### Крок 8: `OrdersModule` — створення та отримання замовлень
1. DTO `CreateOrderDto`: `customerName`, `contactInfo`, `items: [{ artworkId, optionId, quantity }]` ✅
2. `POST /api/public/orders` (PUBLIC) — Order + OrderItem snapshots (`artworkTitle`, `optionName`, `optionPrice`); після `prisma.order.create()` → `telegramService.sendOrderNotification(order)` ✅
3. `GET /api/admin/orders` (JWT) — список замовлень з items ✅
4. `GET /api/admin/orders/:id` (JWT) — деталі одного замовлення ✅
5. `PATCH /api/admin/orders/:id/status` (JWT) — `{ status: 'CONTACTED' | 'DONE' }` (перехід `NEW → CONTACTED → DONE`) ✅

---

## Фаза 3: Public API + Swagger (кроки 9–10)

### Крок 9: Публічний каталог / storefront API ✅
1. `GET /api/public/artworks` — `status IN (AVAILABLE, SOLD)`; thumbnail URL + **мінімальна ціна опції** (`minOptionPrice`) ✅
2. `GET /api/public/artworks/:id` — деталі: `titleUk/En`, `descriptionUk/En`, photos, options (Uk/En), status ✅
3. Фільтр: виключати лише `DELETED`; `SOLD` — бейдж на фронті, add-to-cart вимкнено ✅

### Крок 10: Swagger / OpenAPI документація ✅
1. `main.ts`: `SwaggerModule.setup('api/docs', app, document)` ✅
2. На кожному контролері: `@ApiTags()`, `@ApiResponse()` для кожного endpoint ✅
3. Перевірити `http://localhost:3000/api/docs` ✅

---

## Фаза 4: Angular — публічний магазин (кроки 11–17)

### Крок 11: Маршрутизація, Tailwind, layout ✅
1. Підключити **Tailwind CSS** у `frontend/` (`architecture-decisions` #6) ✅
2. Структура папок за `architecture.md`: `galleries/`, `cart/`, `checkout/`, `about/`, `contact/`, `faq/`, `core/`, `shared/`, `locale/` ✅
3. `app.routes.ts`: `/`, `/about`, `/contact`, `/faq`, `/gallery`, `/cart`, `/checkout`, `/success`, `/gallery/:id` ✅
4. `DefaultLayoutComponent`: header + `<main><ng-content /></main>` + footer ✅
5. Використовувати **Angular signals** для реактивного стану (cart badge, locale, selected option) — `requirements` E.1 ✅

### Крок 12: Header, навігація, i18n ✅
1. `HeaderComponent`: логотип, посилання (Gallery, About, Contact, Cart) + quantity badge ✅
2. Перемикач мов UA / EN ✅
3. `LocaleService`: зберігає мову в `localStorage.lang`; тексти UI — з файлів `src/app/locale/uk.json` та `en.json` ✅
4. Каталог (title, description, option name) — з API полів `*Uk`/`*En` залежно від обраної мови ✅

### Крок 13: Gallery Page — каталог ✅
1. `ArtworksApiService.getArtworks()` → `GET /api/public/artworks` ✅
2. CSS Grid: mobile 1 col, tablet 2, desktop 3–4 ✅
3. Gallery card: **thumbnail + title + min option price** (`requirements` A.1); клік → `/gallery/:id` ✅
4. Бейдж "Продано" для `status === SOLD` ✅

### Крок 14: Детальна сторінка продукту ✅
1. Головне фото + мініатюри для перемикання ✅
2. `LightboxComponent`: fullscreen, X (top-right), стрілки ліво/право ✅
3. Title (locale) + radio buttons для options — коротко: **name + price** ✅
4. Під фото — **повний description обраної опції** (динамічно при зміні radio) ✅
5. "Додати до кошика" → `cartService.addItem(...)`; вимкнено для `SOLD` ✅
6. `addItem` payload:
   ```ts
   { artworkId, optionId, artworkTitle, optionName, optionPrice, photoUrl, quantity }
   ```
   (`optionId` потрібен для `POST /api/public/orders`) ✅

### Крок 15: Shopping Cart Service (localStorage) ✅
1. `CartService` (signals): `addItem`, `removeItem`, `updateQuantity`, `clear`, `items`, `total`, `itemCount` ✅
2. Персистенція: `localStorage.cart` — масив `CartItem` (див. крок 14) ✅
3. Підключити до `HeaderComponent` — quantity badge ✅

### Крок 16: Cart Page + Checkout ✅
1. `CartPage`: photo, назва, опція, ціна × qty, видалення, subtotal; кнопка → `/checkout` ✅
2. `CheckoutPage`: форма `customerName` + `contactInfo` (required) ✅
3. Submit → `OrdersApiService.submitOrder({ customerName, contactInfo, items })` → `POST /api/public/orders`; success → `/success` ✅
4. Помилки checkout — toast/alert (`architecture-decisions` #7) ✅

### Крок 17: Success Page + Static Pages ✅
1. `SuccessPage`: "Дякуємо за замовлення! Ми зв'яжемось з вами найближчим часом" + кнопка до галереї ✅
2. `AboutPage`: фото + біо (UA/EN з locale files); `ContactPage`: соцмережі, email, месенджери; `FAQPage`: Q&A (UA/EN) ✅
3. SEO meta tags — **відкладено** post-MVP (`architecture-decisions` #8, `architecture.md` §10)

---

## Фаза 5: Angular — Адмінка (кроки 18–20)

### Крок 18: Admin Login + Auth Guard ✅
1. `AdminLoginComponent`: username/password → `POST /api/admin/login` ✅
2. Успіх → `localStorage.token` → redirect `/admin/dashboard` ✅
3. `AdminAuthGuard` для `/admin/*` routes ✅

### Крок 19: Artworks CRUD UI ✅
1. `AdminCatalogPage`: таблиця (thumb, title, status, min price, options count); фільтр: all / available / sold / deleted ✅
2. Форма "Додати роботу": **UA/EN поля** — `titleUk`, `titleEn`, `descriptionUk`, `descriptionEn`; upload до 5 фото (`POST /api/admin/upload` → `POST .../photos`); options — `{ nameUk, nameEn, descriptionUk?, descriptionEn?, price }` ✅
3. Edit pre-filled; кнопки SOLD / DELETED (через `PATCH .../status`) ✅
4. Dynamic option rows: додати/видалити рядок ✅

### Крок 20: Orders Management UI
1. `AdminOrdersPage`: id, customerName, contactInfo, itemsCount, total, status, createdAt
2. Clickable row → деталі: items (artworkTitle, optionName, optionPrice, qty) + контакт клієнта
3. Зміна статусу: `CONTACTED` / `DONE` (`PATCH /api/admin/orders/:id/status`)

---

## Фаза 6: Deploy (post-MVP, поза 20 кроками)

| Задача | Деталі |
|--------|--------|
| Frontend | Vercel project `alinastore` — root `vercel.json` builds `frontend/`; URL https://alinastore.vercel.app |
| Backend | Render `alinastore-api` — root `backend/`; URL https://alinastore-api.onrender.com |
| DB + Storage | Supabase (PostgreSQL + Storage) |
| Prototype | GitHub Pages (`prototype/`, workflow on `master`) |
| Env vars | Frontend: no API URL (Vercel rewrite `/api` → Render). Backend: `DATABASE_URL`, `JWT_SECRET`, `TELEGRAM_*`, `ADMIN_*`, `CORS_ORIGINS` |

## Фаза 7: Security hardening (post-MVP)

| Задача | Деталі | Статус |
|--------|--------|--------|
| **Supabase RLS** | Увімкнути Row Level Security на Prisma-таблицях, щоб anon/authenticated ключі не мали вільного CRUD через PostgREST. SQL готовий: [`backend/prisma/rls-lockdown.sql`](backend/prisma/rls-lockdown.sql). NestJS лишається на `DATABASE_URL` (owner bypass). Без `FORCE ROW LEVEL SECURITY`. | Підготовлено, не застосовано |
| Smoke-check після apply | `GET /api/public/artworks` і admin CRUD мають працювати; PostgREST з anon key — відмова / порожньо | — |

---

# Підсумкова діаграма процесу (20 кроків)

```
Крок 0      │ Прототип (референс дизайну)
Крок 1-3    │ Фундація: monorepo, Angular + NestJS, Prisma DB schema
            ↓
Крок 4-6b   │ Backend Core: JWT Auth + Artworks CRUD + Upload
            ↓
Крок 7-8    │ Telegram Service → Orders Module (з інтеграцією)
            ↓
Крок 9-10   │ Public API + Swagger docs
            ↓
Крок 11-13  │ Frontend: Tailwind, routes, gallery (grid + price)
            ↓
Крок 14-17  │ Detail + Cart + Checkout + static pages
            ↓
Крок 18-20  │ Admin Panel: Login + Artworks CRUD UI + Orders UI
            ↓
Фаза 6      │ Deploy (Vercel + Render + Supabase)
            ↓
Фаза 7      │ Security: Supabase RLS lockdown
```

---

