# Architecture Decisions — alina Art Store

## Summary of All Decisions

| # | Topic | Decision |
|--|--|--|
| 1 | Photo Storage | **Supabase Storage** (S3-compatible, 1GB free) — upload через Backend Proxy для безпеки ключів |
| 2 | JWT Token Storage | `localStorage` on frontend |
| 3 | Telegram Library | `node-telegram-bot-api` (ready wrapper package) |
| 4 | Order Statuses | Only `NEW`, `CONTACTED`, `DONE` |
| 5 | Backend Hosting | **Render Free Tier** + **Vercel** (Angular), **Supabase** (DB+Storage+Admin Auth) |
| 6 | Frontend UI Framework | **Hand-rolled Tailwind CSS** (utility-first, pure classes in HTML) |
| 7 | Error Handling (Checkout) | **Simple Toast / Alert** — minimal MVP approach |
| 8 | SEO Meta Tags | Postponed (Phase 2 — not critical for MVP start) |
| 9 | Admin Panel Auth | **Own DB table** (`AdminUser` + bcrypt hash on the service side) |

---

## Open Questions (Still Pending)

_All pending questions resolved._ ✅
