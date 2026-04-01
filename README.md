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

## Next Implementation Steps

- Add Supabase auth and admin route protection
- Add posts CRUD with draft/publish lifecycle
- Add editor autosave and preview flow
- Add SEO metadata, sitemap, and structured data
