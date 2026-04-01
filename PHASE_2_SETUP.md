# Phase 2: Authentication & Admin Setup Guide

This document covers the authentication system and admin dashboard setup.

## What's Included

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)
- Supabase auth integration with session management
- Real-time auth state changes
- Sign up, sign in, and sign out functions
- User-aware hook: `useAuth()`

### 2. Auth Pages

#### Login Page (`src/app/auth/login/page.tsx`)
- Email/password authentication
- Error handling
- Link to signup for new users
- Redirects to admin dashboard on success

#### Signup Page (`src/app/auth/signup/page.tsx`)
- New account creation
- Password validation (min 6 chars)
- Email confirmation notice
- Link back to login

#### Signup Success (`src/app/auth/signup-success/page.tsx`)
- Confirmation message
- Instructions to check email

### 3. Admin Dashboard (`src/app/admin/dashboard/page.tsx`)
- Protected route (requires login)
- Stats display (total posts, published, drafts)
- Quick actions for new post
- Next steps guide

### 4. Admin Layout (`src/app/admin/layout.tsx`)
- Sidebar navigation
- User info and sign-out button
- Links to posts, categories, tags (placeholders for Phase 3)
- Protected layout wrapper

### 5. Route Protection
- `withAuth()` higher-order component for protecting pages
- Automatic redirect to login for unauthenticated users
- Loading state while checking authentication

## How Authentication Works

1. **On App Load**
   - AuthProvider checks for existing session via `getSession()`
   - Sets user state if authenticated

2. **Auth State Changes**
   - Listens via `onAuthStateChange()` for real-time updates
   - Handles login, logout, signup, password reset events

3. **Protected Routes**
   - Admin routes require valid user session
   - Unauthenticated requests redirect to `/auth/login`
   - Loading state prevents flash before redirect

4. **Session Persistence**
   - Supabase persists session in browser storage
   - Session restored automatically on page reload
   - Auto-refresh token before expiration

## Environment Configuration

Supabase auth is already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://csufywyfavlgndioajqt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
```

## Testing the Auth Flow

### 1. Start the Dev Server
```bash
npm run dev
# App runs on http://localhost:3000
```

### 2. Create a Test Account
- Go to http://localhost:3000/auth/signup
- Enter test email and password
- Check your email for confirmation link
- Confirm account (Supabase sends real emails in production)

### 3. Sign In
- Go to http://localhost:3000/auth/login
- Use the email/password you just created
- Should redirect to `/admin/dashboard`

### 4. Verify Auth State
- Reload page — should stay logged in
- Click "Sign Out" — should redirect to login
- Try accessing `/admin/dashboard` without login — should redirect to login

## Email Confirmation

In development (local):
- Supabase uses fake email provider by default
- You can skip verification in settings if needed

In production (Vercel):
- Real emails will be sent
- Users must click confirmation link
- Configure email provider in Supabase Dashboard

## Next Steps: Phase 3

Once auth is working:
1. Build post CRUD API routes
2. Create post list, detail, and editor pages
3. Implement autosave and draft management
4. Add tag and category management

## Security Considerations

- Passwords hashed with bcrypt (Supabase default)
- JWT tokens used for session management
- Row-level security enforces user data isolation
- All auth routes use HTTPS in production
- Session refresh happens automatically
- Logout destroys all tokens

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing Supabase env vars" | Verify `.env.local` has correct URL and key |
| Login fails silently | Check browser console for error details, verify email/pass correct |
| Stuck on loading screen | Check network tab for Supabase API errors, verify project is active |
| Email not received | In production, check Supabase email settings; in dev, skip verification |
| Session lost after reload | Clear browser storage, re-login, check that Supabase project is active |

## Verification Checklist

- [x] AuthContext created and provides useAuth hook
- [x] Supabase auth client configured
- [x] Login/signup pages built with validation
- [x] Admin layout with sidebar navigation
- [x] Admin dashboard displays user info and stats
- [x] Protected routes redirect unauthenticated users
- [x] Session persistence across page reloads
- [x] Sign out clears session and redirects

Phase 2 is complete! Next: **Phase 3: Blog CRUD Operations**
