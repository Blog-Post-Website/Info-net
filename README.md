# Blog Post Website

Production-ready baseline for a human-operated blog platform.

## Stack

- Next.js (App Router) + TypeScript
- Supabase (Auth, Database, Storage)
- Tailwind CSS
- Vercel deployment target

## Quick Start

1. Install dependencies:
   npm install
2. Configure env vars:
   copy .env.example to .env.local and fill values.
3. Run dev server:
   npm run dev

## Scripts

- `npm run dev` - start local development
- `npm run build` - build for production
- `npm run start` - start production server
- `npm run lint` - run lint checks
- `npm run typecheck` - TypeScript validation

## Free Supabase Keep-Alive

If you are on the Supabase Free tier, inactive projects can pause after several days.

This repo now includes a free keep-alive workflow:

- Workflow file: `.github/workflows/keep-supabase-awake.yml`
- It pings `/api/public/posts?limit=1` every 12 hours.
- It can also run manually from GitHub Actions (`workflow_dispatch`).

Optional (recommended):

- Add a GitHub repository variable named `SITE_URL` and set it to your deployed site URL (for example: `https://infonet-flax.vercel.app`).
- If `SITE_URL` is not set, the workflow uses `https://infonet-flax.vercel.app` by default.

## Next Implementation Steps

- Add Supabase auth and admin route protection
- Add posts CRUD with draft/publish lifecycle
- Add editor autosave and preview flow
- Add SEO metadata, sitemap, and structured data
