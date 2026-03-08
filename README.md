# MyPocket CFO — Setup Guide

This guide gets you from a fresh clone to a running local app using Supabase, Drizzle ORM, and Bun.

## Prerequisites

- Node.js 18+
- Bun 1.x (recommended for scripts): https://bun.sh
- A Supabase project (free tier works)

## 1) Install Dependencies

```bash
bun install
```

You can use npm/pnpm/yarn, but this project’s DB script uses `bunx`.

## 2) Environment Variables

Copy the example and fill in your project details:

```bash
cp .env.example .env
```

Then set these values in `.env`:

- DATABASE_URL — Supabase Postgres connection string (URI)
- VITE_DATABASE_URL — Same Postgres URI (for server bundle env access)
- SUPABASE_URL — Supabase URL
- SUPABASE_ANON_KEY — Supabase anon key
- VITE_SUPABASE_URL — Same as SUPABASE_URL (exposed to frontend)
- VITE_SUPABASE_ANON_KEY — Same as SUPABASE_ANON_KEY (exposed to frontend)

Where to find them in Supabase:

- URL & anon key: Project Settings → API
- Database URL: Project Settings → Database → Connection string → URI

Example:

```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
VITE_DATABASE_URL=postgres://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3) Create the Database Schema

Push the Drizzle schema to your Supabase Postgres:

```bash
bunx drizzle-kit push
```

Schema lives in:

- DB schema: [src/db/schema.ts](file:///d:/projects/mypocket-cfo/src/db/schema.ts)
- Drizzle client: [src/db/drizzle.ts](file:///d:/projects/mypocket-cfo/src/db/drizzle.ts)

Tables created:

- `pockets` — budgets/goals and recurring checklists
- `pocket_items` — checklist items per recurring pocket
- `transactions` — income/expense entries

All tables include `user_id` for multi-user scoping.

## 4) Run the App

```bash
bun run dev
```

Open the local URL shown in the terminal (Vite dev server).

## 5) Sign Up and Log In

- Visit `/register` to create an account, or `/login` to sign in.
- After authentication, you’ll be redirected to the dashboard.

## 6) Using the App

- Create pockets and checklist items on the Pockets page.
- Use “Smart Input” on the Dashboard to add transactions in natural language.
- Totals, trends, and “spent per pocket” update automatically.

## Scripts

- Dev server: `bun run dev`
- Build: `bun run build`
- Preview: `bun run preview`
- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Push DB schema: `bun run db:push` (alias to `bunx drizzle-kit push:pg`)

## Project Structure Highlights

- Server functions and DB access:
  - [src/server/finance.ts](file:///d:/projects/mypocket-cfo/src/server/finance.ts)
  - [src/db/schema.ts](file:///d:/projects/mypocket-cfo/src/db/schema.ts)
  - [src/db/drizzle.ts](file:///d:/projects/mypocket-cfo/src/db/drizzle.ts)
- Routes/UI:
  - Dashboard: [src/routes/index.tsx](file:///d:/projects/mypocket-cfo/src/routes/index.tsx)
  - Pockets: [src/routes/pockets.tsx](file:///d:/projects/mypocket-cfo/src/routes/pockets.tsx)
  - Settings: [src/routes/settings.tsx](file:///d:/projects/mypocket-cfo/src/routes/settings.tsx)
  - Auth pages: [src/routes/login.tsx](file:///d:/projects/mypocket-cfo/src/routes/login.tsx), [src/routes/register.tsx](file:///d:/projects/mypocket-cfo/src/routes/register.tsx)
- Supabase client: [src/lib/supabase.ts](file:///d:/projects/mypocket-cfo/src/lib/supabase.ts)

## Troubleshooting

- Schema push fails
  - Confirm `DATABASE_URL` is correct and reachable (Supabase → Settings → Database).
  - Ensure the IP or local network can reach Supabase (if applicable).

- Auth issues
  - Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set and match your project.
  - Make sure the site is served from a URL allowed by Supabase (Settings → Authentication → URL Configuration).

- Windows PowerShell blocks npm scripts
  - Use Bun (`bun run ...`), or adjust PowerShell execution policy as needed.

You’re ready! Create a pocket, add a few transactions, and explore your new personal finance dashboard.
