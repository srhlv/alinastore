# Requirements Document — alina Art Store

## Project Overview
- **Project:** Online art store/gallery for artist "alina"
- **Status:** Requirements gathering COMPLETE ✅
- **Date started:** 2026-07-03
- **Client:** Husband building a site for his wife, an artist

---

## Site Structure (Public Pages)
| Page | Description |
|--|---|
| Gallery / Catalog | Visual grid of artworks; each card shows photo, title |
| Product Detail | Photo(s), title, description, selectable options, add to cart |
| Cart | Selected items summary + checkout button |
| Checkout | Guest-only order form (Name + How to contact) |
| Success Page | "Order received" confirmation with friendly message |
| About the Artist | Photo + short bio in UA/EN |
| Contact | Social links, email, address, messenger contacts |
| FAQ | Frequently asked questions (delivery, ordering process, etc.) |

---

## Functional Requirements

### A. Public Storefront (Guest-only — no registration)
- **A.1 Gallery / Catalog** — Visual grid of artworks; each card shows photo + title + price
       - No search bar, no filters/sort — just clean visual layout
- **A.2 Product detail page :**
       - Photo(s) — up to 5 photos per artwork (1 main)  Lightbox: click photo → opens full-screen closeable with X button (top-right corner) Title + description text

   Each artwork has selectable options (one-dimensional list, single-select). Only ONE option can be chosen.
       - Each option has: `name` + `description` + `price`
       - **UI:** Under the photo → displays the full description of the SELECTED option

       In select/radio area → shows only `name` and `price` (short format)
       - **Price comes ONLY from the selected option — no base price**
- **A.3 Shopping cart** — Add/remove works to/from cart; per-item total + overall subtotal displayed
- **A.4 Checkout (no online payment)** — Guest checkout with minimal fields: `Name` + `How to contact` (single text field — phone, telegram, or email)
       - Order statuses flow: `new` → `contacted` → `done`
- **A.5 Bilingual support** — Ukrainian (default) + English with i18n language switcher

### B. Admin Panel (simple username/password login)
- **B.1 Catalog management:**
       - Add new artwork (title, description, up to 5 photos)
      _Edit artwork_ (title, description, photos, remove/deactivate)
_**Mark artwork as "sold"- Manage options per artwork: add/remove/change name + description + price
- **B.2 Orders management:**
- View list of orders with details (customer name, contact, selected artworks + chosen options, total)
       - Change order statuses: `new` → `contacted` → `done`

### C. Order Notifications
- **C.1 Telegram notification** — New order is delivered to artist via Telegram bot/chat with full order details (artwork list, options selected, customer info)

---

## Non-Functional Requirements

### Design & UX
- **D.1 Minimalist black & white style**
- **D.2 Reference:** inspired by `https://www.ramon-rodrigues.com/loja-store`
- **D.3 Mobile responsive — works well on phones/tablets
       - **D.4 Two languages: Ukrainian + English (i18n switcher)**

### Technical
- **E.1 Frontend:** Angular (standalone components, signals)
- **E.2 Backend:** NestJS (Node.js, TypeScript-first) — "Angular-style" architecture with DI, modules
- **E.3 Database PostgreSQL or SQLite (for artworks, orders admin users)
- **E.4 Auth for admin: simple username/password login (JWT token)
- **E.5 Hosting PaaS (Vercel for frontend + Render/Railway for backend + DB)
