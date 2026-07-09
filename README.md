# alina Art Store

Online art gallery and store for artist alina.

## Structure

| Directory | Description |
|-----------|-------------|
| `prototype/` | Static HTML/CSS mockup (design reference, deployed via GitHub Pages) |
| `frontend/` | Angular 22 storefront + admin panel |
| `backend/` | NestJS API + Prisma ORM |
| `supabase/` | Supabase project config |

## Prerequisites

- Node.js 22+
- npm
- Supabase project (PostgreSQL + Storage)

## Setup

```bash
# Copy environment variables
cp backend/.env.example backend/.env
# Fill in DATABASE_URL (Supabase), JWT_SECRET, Telegram credentials

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Apply migrations (after DATABASE_URL is set)
cd backend && npx prisma migrate deploy
```

## Development

```bash
# From repo root
npm run dev:frontend   # http://localhost:4200
npm run dev:backend    # http://localhost:3000
```

## Docs

- [requirements.md](./requirements.md) — functional requirements
- [architecture.md](./architecture.md) — tech stack and DB schema
- [implementation-plan.md](./implementation-plan.md) — step-by-step build plan
