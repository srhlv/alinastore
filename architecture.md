# Architecture — alina Art Store

## 1. Tech Stack Summary

| Layer | Technology | Notes |
|--|--|--|
| **Frontend** | Angular 22 (Standalone Components, Signals) | No NgModules; modern approach with `@angular/core` signals for reactivity |
| **Backend** | NestJS (Node.js, TypeScript) | Modules, DI, Controllers, Services structure. Express under the hood |
| **Database** | Prisma ORM + PostgreSQL | Type-safe queries. PostgreSQL for production, SQLite for dev/testing |
| **Hosting** | PaaS — Vercel (frontend) + Render/Railway (backend + DB) | Zero-config deploys from Git branches |


## 2. Project Directory Structure

```
alina/
├── prototype/                     ← Visual mockup (static HTML/CSS/JS)
│         └── index.html            ← Gallery layout preview + placeholder images
│
├── frontend/                    ← Angular application
│     └── src/app/
│         ├── galleries/              ← Artwork gallery listing
│         ├── galleries/detail/       ← Individual artwork detail page
│         ├── cart/                   ← Shopping cart page
│         ├── checkout/               ← Guest checkout form
│         ├── success/                ← Order confirmation page
│         ├── about/                  ← About the Artist
│         ├── contact/                ← Contact page
│         ├── faq/                    ← FAQ page
│         ├── admin/                  ← Admin panel pages/modules
│         ├── core/                   ← Core singletons (auth, cart service, Telegram bot)
│         ├── shared/                 ← Shared UI components (lightbox, empty state etc.)
│         └── app.routes.ts           ← Router config (standalone routes)
│     └── src/assets/             ← Static assets (images, fonts, icons)
│     └── src/app/locale/         ← i18n locale files (`uk`, `en`)
│     └── angular.json              ← Angular project config

├── backend/                     ← NestJS API server
│     └── src/
│         ├── app.module.ts       ← Root module (imports all modules)
│         ├── artworks/           ← CRUD operations for artworks & options
│         ├── orders/             ← Order creation, status management
│         ├── admin/              ← Admin auth, user management
│         └── upload/             ← Image upload handling, file storage
├── prisma/schema.prisma        ← Prisma DB schema definition
└── package.json                  ← Backend dependencies + scripts

├── docker-compose.yml           ← Local PostgreSQL for dev environments
└── README.md                      ← Build, deploy & run instructions
```


## 3. Database Schema (Prisma)

> **Decisions (2026-07-08):** i18n via separate `*Uk`/`*En` fields on `Artwork` and `Option`; extended snapshot on `OrderItem`; `SOLD` artworks remain visible in gallery with a badge; `Photo.sortOrder` for display order.

### Model: `Artwork` — Art piece data with relations

```prisma
model Artwork {
  id            String      @id @default(cuid())
  titleUk       String
  titleEn       String
  descriptionUk String?
  descriptionEn String?
  status        ArtStatus   @default(AVAILABLE)
  options       Option[]
  photos        Photo[]
  orderItems    OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

enum ArtStatus {
  AVAILABLE   // shown in gallery, can be added to cart
  SOLD        // shown in gallery with "Sold" badge; add-to-cart disabled
  DELETED     // soft-delete; hidden from public gallery
}
```

### Model: `Option` — Selectable choices for an artwork

```prisma
model Option {
  id              String  @id @default(cuid())
  nameUk          String  // shown in select/radio (short format)
  nameEn          String
  descriptionUk   String? // full text under photo when this option is selected
  descriptionEn   String?
  price           Decimal @db.Decimal(10, 2) // final price — no base artwork price
  artworkId       String
  artwork         Artwork @relation(fields: [artworkId], references: [id], onDelete: Cascade)
}
```

### Model: `Photo` — Images for artwork (max 5 per artwork, enforced in service)

```prisma
model Photo {
  id        String  @id @default(cuid())
  url       String  // Supabase Storage URL
  isMain    Boolean @default(false)
  sortOrder Int     @default(0)
  artworkId String
  artwork   Artwork @relation(fields: [artworkId], references: [id], onDelete: Cascade)
}
```

### Model: `Order` — Store orders (guest only, no payments)

```prisma
model Order {
  id           String      @id @default(cuid())
  customerName String
  contactInfo  String      // phone / Telegram / email — single free-text field
  total        Decimal     @db.Decimal(10, 2)
  status       OrderStatus @default(NEW)
  cartJson     Json?       // raw cart snapshot (backup alongside normalized OrderItems)
  items        OrderItem[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

enum OrderStatus {
  NEW
  CONTACTED
  DONE
}
```

### Model: `OrderItem` — Individual items inside an order (snapshot at order time)

```prisma
model OrderItem {
  id           String  @id @default(cuid())
  orderId      String
  order        Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  artworkId    String
  artwork      Artwork @relation(fields: [artworkId], references: [id])
  artworkTitle String  // snapshot — readable even if artwork is later deleted
  optionName   String  // snapshot of selected option name
  optionPrice  Decimal @db.Decimal(10, 2)
  quantity     Int     @default(1)
}
```

### Model: `AdminUser` — Simple admin panel login (username + password)

```prisma
model AdminUser {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
}
```

### Entity Relationship Diagram (ERD)

```
AdminUser          Order              OrderItem           Artwork              Option              Photo
─────────          ─────              ─────────           ─────────            ───────             ──────
• id               • id               • id                • id                 • id                • id
• username         • customerName     • orderId           • titleUk/En         • nameUk/En         • url
• password         • contactInfo      • artworkId         • descriptionUk/En   • descriptionUk/En  • isMain
                   • total            • artworkTitle      • status             • price             • sortOrder
                   • status           • optionName
                   • cartJson         • optionPrice
                   • createdAt        • quantity

Artwork 1──* Option
Artwork 1──* Photo   (0..5, max enforced in service)
Order   1──* OrderItem ──* Artwork
```

**Public gallery query:** `status IN (AVAILABLE, SOLD)` — exclude `DELETED` only.

**Static pages (About, Contact, FAQ):** i18n via frontend locale files — no DB model.


## 4. API Endpoints (NestJS)

> **Conventions:** Public routes under `/api/public/*`; admin routes under `/api/admin/*` (JWT required, except login). Swagger at `/api/docs`.

### Public APIs — No authentication required

| Method | Path | Description |
|--|--|--|
| `GET` | `/api/public/artworks` | List artworks with `status IN (AVAILABLE, SOLD)` — thumbnail, min option price |
| `GET` | `/api/public/artworks/:id` | Artwork detail: photos, options, descriptions (UK/EN) |
| `POST` | `/api/public/orders` | Guest checkout — create `Order` + `OrderItem` snapshots; triggers Telegram notification |

**Public gallery filter:** `status IN (AVAILABLE, SOLD)` — exclude `DELETED` only. `SOLD` shown with badge; add-to-cart disabled on frontend.

### Admin Auth

| Method | Path | Description |
|--|--|--|
| `POST` | `/api/admin/login` | `{ username, password }` → `{ accessToken }` |

### Admin Artworks — JWT required

| Method | Path | Description |
|--|--|--|
| `GET` | `/api/admin/artworks` | List all artworks (including `DELETED`) with photos and options |
| `POST` | `/api/admin/artworks` | Create artwork + nested options |
| `PUT` | `/api/admin/artworks/:id` | Update title/description; full replacement of options list |
| `PATCH` | `/api/admin/artworks/:id/status` | Set `AVAILABLE` / `SOLD` / `DELETED` |
| `DELETE` | `/api/admin/artworks/:id` | Soft delete (`status = DELETED`) |
| `POST` | `/api/admin/artworks/:id/photos` | Add photo (max 5 per artwork, enforced in service) |
| `DELETE` | `/api/admin/artworks/:id/photos/:photoId` | Remove photo |
| `PATCH` | `/api/admin/artworks/:id/photos/:photoId` | Update `isMain`, `sortOrder` |

### Admin Upload — JWT required

| Method | Path | Description |
|--|--|--|
| `POST` | `/api/admin/upload` | `multipart/form-data` → Supabase Storage proxy → `{ url }` |

### Admin Orders — JWT required

| Method | Path | Description |
|--|--|--|
| `GET` | `/api/admin/orders` | List all orders with items |
| `GET` | `/api/admin/orders/:id` | Single order with full item details |
| `PATCH` | `/api/admin/orders/:id/status` | `{ status: CONTACTED \| DONE }` |

---

## 5 .Frontend Architecture (Angular)

### Module Breakdown

| Module | Purpose | Key Services
|--|--|--|
| galleries    ← Artwork listing page, artwork detail
| cart       ← Shopping cart management via localStorage
| checkout     ← Checkout form + order submission
| about        ← About the artist page
| contact      ← Contact info page 
| faq          ← FAQ questions/answers
| admin        ← Admin panel (Artworks CRUD, Orders list)
|--|--|--|

### Cart Flow (localStorage based)

```
[Gallery Card] → click → [Detail Page] → select option + "Add to cart" → [Cart Service] updates localStorage
                                                                                      ↑                    → user can add more items from any page
                                                                                      → user can also edit/remove items in cart page
```

### Key Services (Core Module)

| Service | Responsibility |
|--|--|
| AuthService        ← Admin login/logout, JWT token management
| CartService        ← Manage localStorage cart data + total
| ArtworksApiService     ← Fetch artworks, options, photos
| OrdersApiService       ← Submit orders, get order status

### Key Components (Standalone)

| Component | Role |
|--|--|
| LightboxComponent  ← Full screen photo viewer with close button (top-right X)
| EmptyStateComponent    ← Placeholder when no items in cart/gallery empty
| SortSelectComponent   - Optional filter controls for future use
| HeaderComponent              ← Logo + navigation links + language switcher


## 6 Backend Architecture (NestJS)

### Modules Breakdown

| Module | Responsibility | Key Features |
|--:--|---|
| ArtworksModule | Artwork CRUD, options, photo management |
| OrdersModule | Public order submit + admin order list/status + Telegram notification |
| AdminAuthModule | Login, JWT guard |
| UploadModule | Image upload proxy to Supabase Storage |

### Key Services (Core Module)
  - ArtworkService: Fetch all artworks with options/photos
  - OrderService     ← Manage orders, handle status transitions, integrate with backend services
    - TelegramNotificationService          ← Send order notifications to artist bot/chat


### JWT Auth Flow (Admin Panel)

```
[Admin Page] --login--> [AuthService.login()]     → validate username/password via DB
      ↓ [returns JWT]
  [Subsequent requests with @Get() Guard   → protect all admin endpoints
```

## 7 .Deployment Architecture (PaaS)

### Frontend Hosting: Render.com  (Vercel/Netlify alternative)

- **Build command:** `npm run build -- prod`
- **Output directory:** `dist/alina-store` 
- **Static + API proxy** (if backend is in same app, or separate Vercel deployment)


### Backend Hosting: Render.com

- **Build command:** `npm install && npm run build`
- **Start command:** `node dist/main.js`
- **Environment variables:**
    `DATABASE_URL        ← Render internal PostgreSQL URL
    `TELEGRAM_BOT_TOKEN` ← Required for sending order notifications to Telegram bot
    `JWT_SECRET`         ← Signing key used for JWT tokens
    `ADMIN_USERNAME / ADMIN_PASSWORD`  ← Initial admin account username and password

### Local Development Setup (Docker Compose)

```bash
# Start PostgreSQL locally 
docker-compose up -d

# Run migrations first time
cd backend && npx prisma migrate dev

# Serve frontend + backend in watch mode from same local directory
ng serve && nest start --watch
```

### CI/CD Deployment Flow (Render/Vercel)

1. Push changes to main branch → triggers automatic rebuilds


## 8. Data flow: Artwork Creation → Gallery Display

```
Admin Panel ──upload photo──→ [POST /api/admin/upload] → Supabase Storage URL
Admin Panel ──create artwork──→ [POST /api/admin/artworks] + [POST /api/admin/artworks/:id/photos]
        ↓ NestJS ArtworkService.save()
   Prisma stores Artwork + Option + Photo records

   Gallery Page (Angular) ──fetch──> [GET /api/public/artworks] → Rendered visual grid
```

### Data flow: Order Creation → Telegram Notification

```
[Artwork Detail Page] — select artwork(s) + options → "Add to Cart"
         ↓ LocalStorage updates
[Checkout Form] — fill Name + Contact Info → Submit
         ↓ Angular calls [POST /api/public/orders]
         ↓ NestJS saves order in Order DB + TelegramService.sendOrderNotification()
    Artist receives new order notification on Telegram

### Data flow: Artwork Status Update → Gallery Update
Admin Panel — marks artwork as sold/available/deleted → [PATCH /api/admin/artworks/:id/status]
       ↓ NestJS updates status in DB

Gallery Page → fetches fresh list [GET /api/public/artworks] → Shows updated status (SOLD badge)

## 9. Key Design Decisions & Rationale

| Decision | Rationale |
|--|--|
| Cart via localStorage (not server-based) | Simplifies backend, no user accounts needed for guest checkout works without registration |
| NestJS over Express.js/ Fastify | Angular-like developer experience (modules/DTOs/guards), TypeScript-first = same language on both sides
| Prisma ORM | Type-safe queries from DB to TypeScript, auto-generated migrations, clean schema
| PaaS Hosting (Render/Vercel) | Zero DevOps overhead. Deploy from Git push automatically — no manual server management required
| Minimal black & white UI for public store | Clean gallery focus. Let the art speak without visual noise distractions
| Functional admin interface (not stylized)  - Admin panel priority is functionality + ease of use over aesthetics. Keep it simple and fast

## 10. Open/Deferred Items (For Future Phases)

| Item | Phase | Notes |
|--|--|--|
| Preview before publishing | v2 | Show artwork as it will appear in gallery before making changes live
| SEO meta tags / Open Graph | v2 | Basic SEO optimization for search engine visibility + social sharing links
| Customer account registration (with purchase history) | v3 | Optional feature for returning clients who want order tracking/account management  
| Image resize/compress on server side | v1.1 | Server-side compression to reduce storage costs and improve page load speeds
| Search + Filter in Gallery |  | Add search bar for quick artwork discovery once we have more items than just one or two main images |

---
