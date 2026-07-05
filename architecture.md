# Architecture — alina Art Store

## 1. Tech Stack Summary

| Layer | Technology | Notes |
|--|--|--|
| **Frontend** | Angular 18+ (Standalone Components, Signals) | No NgModules; modern approach with `@angular/core` signals for reactivity |
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

### Model: `Artwork` — Art piece data with relations

```prisma
model Artwork {
  id           String   @id @default(cuid())
  title        String
  description  String?
  options      Option[]          ← One artwork has multiple selectable options
  photos       Photo[]          ← Up to 5 photos per artwork
  status       ArtStatus @default(AVAILABLE)  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum ArtStatus {
  AVAILABLE
  SOLD
  DELETED        ← For soft-delete before final removal
}
```

### Model: `Option` — Selectable choices for an artwork

```prisma
model Option {
  id          String   @id @default(cuid())
  name        String      ← Shown in select/radio (e.g. "Digital", "Dot Work")
  description String?    ← Full explanation shown under photo after selection
  price       Float      ← Main cost of this option (final price = artwork base + options sum)
  
  artworkId   String?
  artworks    Artwork[]  @relation("ArtworkOptions")
}
```

### Model: `Photo` — Images for artwork up to limit

```prisma
model Photo {
  id          String   @id @default(cuid())
  url         String
  isMain      Boolean @default(false) ← Primary / thumbnail
  
  artworkId   String?
  artworks    Artwork[] @relation("ArtworkPhotos")
}
```

### Model: `Order` — Store orders (guest only, no payments)

```prisma
model Order {
  id            String     @id @default(cuid())
  
  // Customer contact info
  customerName  String
  contactInfo   String      ← Phone / Telegram / Email
  
  // Artwork items chosen by cart + option mapping
  cartJson      Json        ← Raw Cart payload (artworks + selected options)
  total         Float       ← Calculated at time of submission
  
  // Order workflow status
  status        OrderStatus @default(NEW)
  
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  artworks      OrderItem[] ← Breakdown of each work in cart with selected options
}

enum OrderStatus {
  NEW
  CONTACTED
  DONE
}
```

### Model: `OrderItem` — Individual items inside an order

```prisma
model OrderItem {
  id          String   @id @default(cuid())
  
  artworkId   String
  artwork     Artwork  @relation(fields: [artworkId], references: [id])
  
  // Snapshot of the option chosen at time of ordering
  optionName  String   ← Fallback if option later deleted from DB
  
  quantity    Int      @default(1)
}
```

### Model: `AdminUser` — Simple admin panel login (username password)

```prisma
model AdminUser {
  id       String   @id @default(cuid())
  username String   @unique
  password String   ← Hashed (bcrypt)
  
  createdAt DateTime @default(now())
}
```

### Entity Relationship Diagram (ERD)

```
AdminUser          Order           OrderItem        Artwork            Option              Photo
─────────          ─────           ──────────       ─────────          ───────         ──────
• id               • id            • id             • id               • id              • id
• username         • customerName  • artworkId        • title            • name                • url
• password         • contactInfo   • optionName       • description      • description        • isMain
                     • total          • quantity         • status           • price                 
                     • status                                   
                     • createdAt                                   ← [Artwork].[Photos] → 0..5 Photos

OrderItem.artworkId = Artwork.id
Order.cartJson contains list of Artworks + selected Options per item
```


## 4. API Endpoints (NestJS)

### Gallery / Public APIs — No authentication required

| Method | Path | Controller/Service | Description |
|--|--|--|--|
| GET | `/api`        ← List artworks with options
| GET | `GET | ```

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
| ArtworksModule     ← Artwork CRUD, option management   ← All gallery artworks, options per artwork  
| OrdersModule       ← Order creation, order list, status updates    ← Create order + send Telegram notification
| AdminAuthModule        ← Login, JWT guard           ← Username/password auth for admin panel access
|--|--|--|

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
Admin Panel ──create artwork──→ [POST /api/admin/artworks] 
        ↓ NestJS ArtworkService.save() 
   Prisma stores in Artwork DB + Option records 

   Gallery Page (Angular) ──fetch─> [GET /api/gallery/artworks] → Rendered visual grid
```

### Data flow: Order Creation → Telegram Notification

```
[Artwork Detail Page] — select artwork(s) + options → "Add to Cart"
         ↓ LocalStorage updates 
[Checkout Form] — fill Name + Contact Info → Submit
         ↓ Angular calls [POST /api/orders/submit] 
         ↓ NestJS saves order in Order DB
    Admin User receives new order notification on Telegram (Bot sends message with order summary details)

### Data flow: Artwork Status Update → Gallery Update
Admin Panel — marks artwork as sold/available/deleted → [PUT /api/admin/artworks/:id/status] 
       ↓ NestJS updates status in DB 

Gallery Page → fetches fresh list [GET /api/gallery/artworks] → Shows updated status  

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
