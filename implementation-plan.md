# Реалізація — alina Art Store (20 кроків)

> Кожен з 20 кроків розбито на деталізовані підкроки.  
> Кожна підкрока = окрема одиниця яка виконується послідовно.

---

## Фаза 1: Foundation / Підготовка проєкту (кроки 1–3)

### Крок 0: Прототип — Візуальний макет
1. Створити `prototype/` папку в корені репозиторію
2. Написати `index.html` з базовою структурою: header, gallery grid, footer
3. Додати `styles.css` — black & white minimalist style (чорний текст на білому фоні)
4. Створити 3–5 placeholder-карток artwork з тестовими фото та назвами
5. Переглянути макет у браузері на мобільному + десктопі
6. Отримати затвердження від клієнта — тільки після цього переходити до Angular
7. Прототип залишається як референс для дизайну, не деплоїться

### Крок 1: Ініціалізація репозиторію та проекту
1. Створити пустий Git-репо на GitHub/GitLab з назвою `alina-store`
2. Клонувати репо локально, створити структуру монойоденого проекту: папки `frontend/`, `backend/`, README.md
3. Встановити Angular CLI глобально (`npm i -g @angular/cli`)
4. Створити фронтенд-проект з флагами --standalone=true, --strict=true
5. Створити backend проект через `nest new backend`, встановити Prisma залежності
6. Додати root `.gitignore` (node_modules, dist, .env), root package.json з convenience-скриптами (`dev:frontend`, `dev:backend`)
7. Створити `.env.example` в корені репо — DB URL, BOT TOKEN, JWT SECRET placeholder

### Крок 2: Створення БД та Prisma міграцій
1. В `backend/` створити папку `prisma/` + файл `schema.prisma`
2. Описати модель `AdminUser`: id (cuid), username (unique), password, createdAt
3. Описати модель `Artwork`: id, title, description, status enum (AVAILABLE/SOLD/DELETED), createdAt, updatedAt
4. Описати модель `Option`: id, name, description?, price, relation to Artwork
5. Описати модель `Photo`: id, url, isMain (boolean), relation to Artwork (max 5 photos per artwork)
6. Описати модель `Order`: id, customerName, contactInfo, status enum (NEW/CONTACTED/DONE), total, createdAt
7. Описати модель `OrderItem`: id, artworkId, optionNameAtTime, quantity, relation to Order
8. Запустити міграцію: `cd backend && npx prisma migrate dev --name init`
9. Перевірити створену БД через `npx prisma studio` — переконатися що всі таблиці присутні

### Крок 3: Базова структура NestJS + Angular
1. В `backend/src/app.module.ts` підключити пусті placeholder модули: AdminAuthModule, ArtworksModule, OrdersModule (створити порожні .module.ts файли)
2. У `backend/src/main.ts` додати глобальний ValidationPipe (`whitelist: true, transform: true`)
3. Встановити додаткові NestJS пакети: @nestjs/swagger, class-validator, bcryptjs, jsonwebtoken
4. Створити базовий Angular компонент AppComponent з простою заголовком "alina art" як плейсхолдер
5. Додати глобальні CSS-змінні в `styles.css`: кольори (--color-black, --color-white), базові шрифти (system sans-serif)

---

## Фаза 2: Backend — CRUD для каталогу та замовлень (кроки 4–7)

### Крок 4: Реалізація `AdminAuthModule` — логін та JWT
1. Створити `admin-auth.service.ts`: метод `validateUser(username, password)` виконує Prisma query по DB + порівняння bcrypt.compare()
2. Додати функцію `generateToken(payload)`: створює JWT токен з `JWT_SECRET`, 7 днів expiry
3. Створити Controller `POST /api/admin/login` — приймає `{ username, password }`, повертає `{ accessToken }`
4. Створити `admin-seed.ts` скрипт: створює першого адміна з хешованим паролем через bcrypt.hash() — запускати однократно вручну
5. Протестувати endpoint через Postman/curl: правильні credentials -> 200 OK + token; неправильні -> 401 Unauthorized

### Крок 5: JWT Guard та захист роутів адмінки
1. Створити `JwtAuthGuard` клас: розпаковує `Authorization Bearer <token> header, викликає jwt.verify() з `JWT_SECRET`, кидає 401 якщо невалідний
2. Додати декоратор @UseGuards(JwtAuthGuard) на всі controler методи адмінки (orders та artworks CRUD)
3. На Angular-сторі створити `AdminAuthService` що зберігає токен в `localStorage.token` після успішного логіну
4. Створити `JwtHttpInterceptor`: читає token з localStorage та додає до кожного HTTP заголовка `Authorization: Bearer <token>`
5. Протестувати: без токена -> 401 Forbidden; з токеном -> success response

### Крок 6: `ArtworksModule` — CRUD для каталогу (адмінка)
1. Створити DTO `CreateArtworkDto`: поля `title`, `description?`, `options: [{ name, description?, price }]`
2. Створити DTO `UpdateArtworkDto`: ті ж поля але всі @IsOptional() — дозволяє оновлювати лише потрібні
3. Реалізувати `GET /api/admin/artworks` — повертає масив всіх artwork з photos та options (Prisma relation include)
4. Реалізувати `POST /api/admin/artworks` — створює Artwork + nested create для Options через Prisma
5. Реалізувати `PUT /api/admin/artworks/:id` — оновлює title/description, повна підміна списку опцій (old delete -> new insert)
6. Реалізувати `DELETE /api/admin/artworks/:id` — soft delete (`status = DELETED`) або фізичне видалення

### Крок 7: `OrdersModule` — створення та отримання замовлень
1. Створити DTO `CreateOrderDto`: поля `customerName`, `contactInfo`, `items: [{ artworkId, optionName? }]`
2. Реалізувати `POST /api/admin/orders/submit` (PUBLIC endpoint!) — створює Order + масив OrderItem з кожного товару в cart
3. Реалізувати `GET /api/admin/orders` (PROTECTED) — повертає список всіх замовлень з artwork details та optionNameAtTime
4. Додати `PATCH /api/admin/orders/:id/status` — приймає `{ status: 'CONTACTED' | 'DONE' }`, оновлює Order.status

---

## Фаза 3: Telegram integration й Public API (кроки 8–10)

### Крок 8: Сервіс відправки замовлень в Telegram
1. Встановити пакет `node-telegram-bot-api` або використовувати axios для HTTP запитів до Bot API
2. Створити `TelegramService`: метод `sendOrderNotification(orderInfo)` формуює readable message та викликає `bot.sendMessage(chatId, text)`
3. Додати `.env` змінні: `TELEGRAM_BOT_TOKEN` (токен від @BotFather), `TELEGRAM_CHAT_ID` (ID чату/каналу куди надходить повідомлення)
4. Викликати TelegramService в момент створення order — після `prisma.order.create()` викликати `telegramService.sendOrderNotification(order)`
5. Протестувати: створити test order через Postman -> переконатись що повідомлення приходить в Telegram

### Крок 9: Публічний каталог / storefront API
1. Створити `GET /api/public/artworks` — повертає список ARTWORK з status = 'AVAILABLE', включаючи thumbnail photo URL та option prices
2. Створити `GET /api/public/artworks/:id` — детальна інфа по одній роботі: title, description, усі photos, всі options
3. Додати фільтрацію в публічний endpoint: завантажувати тільки status !== 'DELETED' та status === 'AVAILABLE'

### Крок 10: Swagger / OpenAPI документація для NestJS
1. В `main.ts` додати SwaggerModule.setup('api/docs', app, document) — імпортувати @nestjs/swagger
2. На кожному контролері додати декоратори @ApiTags() та @ApiResponse() для кожного endpoint
3. Протестувати: відкрити `http://localhost:3000/api/docs` в браузері — переконатись що всі endpoint існують з описами

---

## Фаза 4: Angular — публічний магазин (кроки 11–17)

### Крок 11: Маршрутизація Angular, мова та базовий layout
1. Створити `app.routes.ts` з роутами: `/`, `/about`, `/contact`, `/faq`, `/gallery`, `/cart`, `/checkout`, `/success`, `/gallery/:id`
2. Додати `<router-outlet></router-outlet>` у головний шаблон `app.component.html`
3. Створити `DefaultLayoutComponent` з `<nav>` для header + `<main><ng-content /></main>` + footer з контактами

### Крок 12: Header з навігацією та лінг-перемикачем
1. Створити `HeaderComponent`: логотип (текст "alina" або SVG), посилання (Gallery, About, Contact, Cart) + quantity badge корзини
2. Додати перемикач мов: кнопки <button (click)="switchLang('ua')">UA</button> та <button (click)="switchLang('en')">EN</button>
3. Реалізувати `LocaleService`: зберігає вибрану мову в localStorage.lang, provides i18n-переклад доступних текстових елементів

### Крок 13: Galerie Page — відображення каталогу
1. Створити ArtworksService.getArtworks() - виклик GET /api/public/artworks повертає масив об'єктів
2. Побудувати gallery grid layout на CSS Grid: адаптивний (mobile 1 column, tablet 2 cols, desktop 3-4 columns)
3. Кожна gallery card: [thumbnail foto] + title; click по картці -> routerLink="/gallery/:id" для detail page

### Крок 14: Детальна сторінка продукту (Artwork Detail Page)
1. Відобразити головне фото зверху в рядку; під ним - всі додаткові мініатюри для gallery перемикання між ними
2. Реалізувати Lightbox компонент: клік по фото -> fullscreen overlay із закриттям по X (top-right corner); стрілки ліво/право для навігації
3. Зверху праворуч — title + опція опису; нижче відображати список options як Radio Buttons з name + price (коротко)
4. Під gallery photo-block відображати description обраної опції що динамічно змінюється при перемиканні Radio button
5. Кнопка "Додати до кошика" внизу -> викликає cartService.addItem({artworkId, optionName}) та оновлює quantity badge у header

### Крок 15: Shopping Cart Service (localStorage-based)
1. Створити `CartService` з методами: addToCart(item), removeFromCart(id), updateQuantity(id, qty), clear(), getItems(), getTotal()
2. Персистентно зберігати стан кошика в localStorage.cart як JSON масив; парсити та десериалізувати при завантаженні сторінки
3. Підключити CartService до HeaderComponent для відображення quantity badge (цифра біля слова "Кошик")

### Крок 16: Cart Page + Checkout Form
1. На `CartPage` показати список елементів кошика з photo, назвою, обраною опцією, ціною; кнопка видалення для кожного
2. Обчислити та відобразитиsubtotal загальна сума всіх ітемів); кнопка "Перейти до оформлення" -> роут `/checkout`
3. На `CheckoutPage` додати форму з полями: customerName required field, contactInfo required text (phone/telegram/email)
4. По submission форми викликати `ordersApi.submitOrder(customerName, contactInfo, cartItems)` -> POST /api/admin/orders/submit; success редіrek на `/success`

### Крок 17: Success Page + Static Pages (About, Contact, FAQ)
1. Створити `SuccessPage': повідомлення "Дякуємо за замовлення! Ми зв'яжемось з вами найближчим часом" + кнопка повернення до галереї
2. Створити `AboutPage`: фото митця + коротка біографія (UA/EN); `ContactPage`: соцмережі, email, месенджери; `FAQPage`: список запитань та відповідей
3. Переконатись що static сторінки мають правильний <title> та <meta description> теги для SEO

---

## Фаза 5: Angular — Адмінка (кроки 18–20)

### Крок 18: Admin Login Page + Auth Guard для фронтенду
1. Створити `AdminLoginComponent`: форма із полями username/password та кнопкою "Увійти" -> викликає POST /api/admin/login
2. Після успішного логіну — зберегти JWT токен в localStorage.token; автоматично перенаправити на `/admin/dashboard`
3. Створити `AdminAuthGuard` для Angular router: перевіряє наявність localStorage.token та доступ до маршруту адмінки (/admin/*)

### Крок 19: Artworks CRUD UI адмінки
1. Створити `AdminCatalogPage`: таблицю з усіма artwork entries колонки (фото thumb, title, status, ціна, опції); фільтр по статусу (all / available / sold / deleted)
2. Реалізувати форму "Додати нову роботу": поля (title textarea, description textarea, photo upload до 5 шт), options list — кожна {name, description, price} з можливістю додати/видалити рядок
3. На кожній існуючій роботі кнопка "Edit" -> відкриває ту ж форму pre-filled; можна видалити (soft-status DELETED) та помітити як SOLD
4. Для artwork options: dynamic list rows (name, price, description); кнопка "Додати опцію row" + іконка "видалити" для кожної рядка

### Крок 20: Orders Management UI адмінки
1. Створити `AdminOrdersPage`: таблиця замовлень з колонками (id, customer_name, contact_info, items_count, total, status, created_at)
2. Для кожного order — clickable row що розкриває деталі: список обраних робіт разом з вибраними options + контактна інфа клієнта повністю

---

# Підсумкова діаграма процесу (20 кроків)

```
Крок 1-3    │ Фундація: monorepo, Angular + NestJS, Prisma DB schema
            ↓
Крок 4-7    │ Backend Core: JWT Auth + Artworks CRUD + Orders Module
            ↓
Крок 8-10   │ Telegram Integration + Public API + Swagger docs
            ↓
Крок 11-13  │ Frontend: routes, gallery page (visual grid), header+footer
            ↓
Крок 14-17  │ Cart Service (+ Lightbox detail) -> cart page -> checkout form -> success page -> static pages
            ↓
Крок 18-20  │ Admin Panel: Login + Artworks CRUD UI + Orders Management UI
```

---


