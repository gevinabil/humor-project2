# Humor Project 2 - Admin Area

This repository contains a Next.js admin app for Supabase data (profiles, images, captions) with strict admin gating.

## What this implements

- Google OAuth login with Supabase.
- Every `/admin` route requires auth and `profiles.is_superadmin = true`.
- Read profiles.
- Read captions.
- Create/read/update/delete images.
- Dashboard stats for profiles/images/captions.
- Lockout-safe bootstrap flow at `/setup/promote` using a one-time secret + service role key.

## Why you won't get locked out

If admin access requires `is_superadmin = true`, a new user cannot enter `/admin` immediately.

This app solves that by:

1. Requiring Google login first.
2. Allowing a one-time self-promotion flow at `/setup/promote`.
3. Server-side code uses `SUPABASE_SERVICE_ROLE_KEY` to set your `profiles.is_superadmin = true`.
4. Optional email allowlist (`SUPERADMIN_BOOTSTRAP_EMAILS`) limits who can bootstrap.

No RLS policies need to be edited for this.

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000`)
- `SUPERADMIN_BOOTSTRAP_SECRET`
- `SUPERADMIN_BOOTSTRAP_EMAILS` (comma-separated, optional)

## Run locally

```bash
npm install
npm run dev
```

Then:

1. Go to `/login` and sign in with Google.
2. Visit `/setup/promote`, enter bootstrap secret, promote your account.
3. Visit `/admin`.

## Assignment submission checklist

1. Create your caption/rating app (separate Vercel project) and your admin app (this repo) in Vercel.
2. Turn off Vercel Deployment Protection so Incognito can access.
3. Submit the latest commit-specific URLs for both apps in the assignment submission section.
