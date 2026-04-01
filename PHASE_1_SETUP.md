# Phase 1: Supabase Setup Guide

This document walks you through setting up the Supabase database schema for the Blog Post Website.

## Prerequisites

- Supabase project created at https://supabase.com
- Project URL and ANON key (already configured in `.env.local`)
- Access to the Supabase SQL Editor

## Step 1: Copy the SQL Schema

The database schema is located in: `src/lib/supabase/schema.sql`

## Step 2: Execute Schema in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project (`csufywyfavlgndioajqt`)
3. Go to **SQL Editor** in the left sidebar
4. Click **New query** or **+ New**
5. Copy and paste the entire contents of `src/lib/supabase/schema.sql`
6. Click **Run** (or press Ctrl+Enter)

The query will:
- Create ENUM type for post statuses
- Create all required tables: users, posts, categories, tags, post_tags, post_versions
- Create indexes for performance optimization
- Enable Row Level Security (RLS) on all tables
- Create RLS policies for secure data access

## Step 3: Verify Schema Creation

After running the SQL:

1. Go to the **Tables** section in Supabase Dashboard
2. Verify these tables exist:
   - `users`
   - `posts`
   - `categories`
   - `tags`
   - `post_tags`
   - `post_versions`

3. Go to **Authentication** → **Policies** to verify RLS policies are enabled on all tables

## Step 4: Enable Auth Provider (if not already enabled)

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled (it usually is by default)
3. Optional: Enable other providers (Google, GitHub, etc.)

## Step 5: Test Connection Locally

The app is already configured with database types and utility functions.

Test the connection:

```bash
npm run dev
# App runs on http://localhost:3000
```

No errors in the terminal means Supabase is connected successfully.

## Database Schema Overview

### users
- Extends Supabase `auth.users` table
- Stores user metadata and timestamps

### posts
- Core content table
- Supports draft, published, and archived statuses
- Includes SEO metadata (meta_description, featured_image_url)
- Unique constraint on (user_id, slug) for clean URLs

### categories
- Hierarchical content organization
- Unique constraint on (user_id, slug)

### tags
- Flat tagging system for flexible classification
- Many-to-many relationship via post_tags

### post_tags
- Junction table linking posts and tags
- Composite primary key (post_id, tag_id)

### post_versions
- Auto-save history and version control
- Tracks changes with timestamp

## Row Level Security (RLS)

All tables have RLS enabled with these principles:

**Posts:**
- Anyone can read published posts
- Authenticated users can only read/edit/delete their own draft posts

**Tags & Categories:**
- Users can only manage their own tags and categories

**Post Versions:**
- Users can only access versions of their own posts

**Post Tags:**
- Can be read if the post is published or owned by the user
- Can only be managed by the post owner

## Next Steps

After schema setup:
1. Proceed to **Phase 2: Authentication** to add login/logout
2. Implement admin dashboard and protected routes
3. Build post CRUD operations
4. Create the editor interface

## Troubleshooting

**Error: "relation does not exist"**
- Ensure all SQL has been executed successfully
- Check the SQL Editor output for any error messages

**Error: "permission denied for schema public"**
- Verify RLS policies are correctly created
- May need to check Supabase role permissions in Settings

**Connection refused**
- Verify `.env.local` has correct SUPABASE_URL and ANON_KEY
- Check that Supabase project is active and online

**404 on tables**
- Refresh the Supabase dashboard
- Clear your browser cache
