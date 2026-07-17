# Specs — Collections (Post-MVP)

## Meta
- **Feature:** Collections — grouping artworks beyond the flat gallery
- **Status:** Requirements gathering IN PROGRESS
- **Date started:** 2026-07-16
- **Depends on:** MVP catalog (Artwork / Gallery / Admin CRUD) — already shipped
- **Out of scope for this doc:** Implementation plan (comes after specs are locked)

---

## 1. Goal (draft — to confirm)

Колекція — група робіт, об’єднана **однією візуальною темою, технікою чи матеріалами**.

Приклади:
- Dot work — коні
- Dot work — ракушки
- Акварель

Мета для відвідувача: бачити роботи в контексті серії / техніки, а не лише плоский каталог.
Мета для адміна: структурувати каталог за серіями, які вже існують у творчості Alina.

---

## 2. Decisions Log

| # | Topic | Decision | Date |
|--|--|--|--|
| 1 | Що таке Collection | Група робіт за спільною темою / технікою / матеріалами (напр. «dot work коні», «акварель») | 2026-07-16 |

---

## 3. Open Questions

### Round 1 — Concept & UX (asked 2026-07-16)

**Q1. What is a Collection?** ✅
- [x] Кураторська група робіт за темою / технікою / матеріалами
- [ ] Something else — describe:

**Q2. How do collections relate to the existing Gallery?**
- [ ] Gallery stays the “all works” page; collections are additional entry points / filters
- [ ] Gallery is replaced / reorganized around collections (landing shows collections first)
- [ ] Hybrid — describe:

**Q3. Can one artwork belong to multiple collections?**
- [ ] Yes (many-to-many)
- [ ] No (one collection per artwork)
- [ ] Artwork can also live outside any collection

**Q4. Public pages — what do visitors see?**
- [ ] `/collections` — list of collections
- [ ] `/collections/:slug` — collection detail (grid of its artworks)
- [ ] Collection filter/tabs on the existing `/gallery`
- [ ] Other:

**Q5. Collection fields (content model)**
Which of these are needed?
- [ ] Name (UK + EN)
- [ ] Description (UK + EN)
- [ ] Cover image
- [ ] Slug / URL
- [ ] Sort order (manual order of collections)
- [ ] Visibility (published / draft / hidden)
- [ ] Dates / year
- [ ] Other:

**Q6. Admin — how does Alina manage collections?**
- [ ] Full CRUD: create / edit / delete collections
- [ ] Assign artworks to collections (from collection page and/or from artwork edit)
- [ ] Reorder collections
- [ ] Reorder artworks inside a collection
- [ ] Soft-delete vs hard-delete
- [ ] Other:

**Q7. Empty / edge cases**
- [ ] Empty collection visible publicly? (yes / no)
- [ ] Sold artworks still appear inside a collection? (same as gallery: yes + badge)
- [ ] Deleted artworks: auto-removed from collection?
- [ ] Can a collection be deleted if it still has artworks?

**Q8. Priority / MVP-of-collections**
What is the smallest useful version?
- [ ] A: Admin can create collections + assign artworks; public list + detail pages
- [ ] B: Only public grouping (admin assigns; no fancy collection landing)
- [ ] C: Other — describe:

---

## 4. Agreed Requirements

_(Filled as answers land. Structure mirrors `requirements.md`.)_

### A. Public Storefront
_TBD_

### B. Admin Panel
_TBD_

### C. Data Model (sketch)
_TBD_

### D. Non-goals / Explicitly out of scope
_TBD_

---

## 5. Implementation Steps

_(Locked after specs are complete — not started.)_
