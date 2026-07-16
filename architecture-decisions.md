# Architecture Decisions — alina Art Store

## Summary of All Decisions

| # | Topic | Decision |
|--|--|--|
| 1 | Photo Storage | **Supabase Storage** (S3-compatible, 1GB free) — upload через Backend Proxy для безпеки ключів |
| 2 | JWT Token Storage | `localStorage` on frontend |
| 3 | Telegram Library | `node-telegram-bot-api` (ready wrapper package) |
| 4 | Order Statuses | Only `NEW`, `CONTACTED`, `DONE` |
| 5 | Hosting | **Vercel** (Angular frontend, project `alinastore`, monorepo via root `vercel.json`) + **Runsite Free** (NestJS `alinastore`, always-on, root `backend/`) + **Supabase** (PostgreSQL + Storage). Prototype → GitHub Pages. Previously Render Free. |
| 6 | Frontend UI Framework | **Hand-rolled Tailwind CSS** (utility-first, pure classes in HTML) |
| 7 | Error Handling (Checkout) | **Simple Toast / Alert** — minimal MVP approach |
| 8 | SEO Meta Tags | Postponed (Phase 2 — not critical for MVP start) |
| 9 | Admin Panel Auth | **Own DB table** (`AdminUser` + bcrypt hash on the service side) |
| 10 | i18n (catalog) | **Separate fields** — `titleUk`/`titleEn`, `descriptionUk`/`descriptionEn` on `Artwork` and `Option` |
| 11 | SOLD artworks in gallery | **Visible with badge** — public query includes `AVAILABLE` and `SOLD`; add-to-cart disabled for `SOLD` |
| 12 | OrderItem snapshot | Store `artworkTitle`, `optionName`, `optionPrice` at order time |
| 13 | Photo ordering | `sortOrder` field on `Photo` |
| 14 | Guest checkout path | `POST /api/public/orders` — public route, not under `/api/admin/*` |
| 15 | Public gallery filter | `status IN (AVAILABLE, SOLD)` — exclude `DELETED` only |
| 16 | Photo upload API | `POST /api/admin/upload` (Supabase proxy) + photo CRUD on `/api/admin/artworks/:id/photos` |

---

## Open Questions (Still Pending)

_All pending questions resolved._ ✅
