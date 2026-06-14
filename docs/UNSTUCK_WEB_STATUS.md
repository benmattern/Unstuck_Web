# Unstuck Web Status

Last updated: 2026-06-14

## Current Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase JS
- Render static site deployment

## Backend

- Supabase project: `unstuck_backend`
- Supabase Auth handles user identity.
- `profiles` stores user profile and preference data.
- `sessions` stores check-in and reflection session records.
- Row Level Security is enabled for user isolation.
- Users can view and update only their own profile.
- Users can view and create only their own sessions.

## Current Web Features

- Email/password sign in and sign out.
- Profile loading from `profiles`.
- Profile display and `display_name` editing.
- User-scoped theme preference from `profiles.preferred_theme`.
- Supported theme values: `system`, `light`, `dark`.
- Session history for the signed-in user.
- New Short Check-In creation from web.
- Normalized session answer display for both web-created and iOS-created answer formats.
- Render deployment as a static site.

## Current Notes

- Web session creation includes `user_id` from the authenticated Supabase user.
- Session history relies on Supabase RLS for user isolation.
- Profile and theme state are cleared when there is no authenticated session.
- Theme preference is stored per user in Supabase, not browser-local shared storage.

