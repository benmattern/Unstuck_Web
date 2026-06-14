# Unstuck Platform Architecture

## Overview

Unstuck currently consists of a SwiftUI iOS app, a React web companion, and a Supabase backend. The web app is a static frontend deployed on Render and talks directly to Supabase through Supabase JS.

## Web App

The web app is built with:

- React for UI composition.
- TypeScript for type safety.
- Vite for development and production builds.
- Tailwind CSS for styling.
- Supabase JS for auth and database access.

The main web surfaces are:

- `App.tsx`: auth-aware app shell, profile card, theme preference, tab selection.
- `pages/SessionsPage.tsx`: session history and normalized answer rendering.
- `pages/NewCheckInPage.tsx`: Short Check-In creation form.
- `services/sessionService.ts`: session read/create access.
- `services/profileService.ts`: profile read/update access.
- `types/session.ts` and `types/profile.ts`: shared app types.

## Backend

Supabase project: `unstuck_backend`

Primary backend capabilities:

- Auth: identifies users and provides `auth.uid()`.
- `profiles`: user-owned profile and preference records.
- `sessions`: user-owned session records.
- RLS: enforces user isolation at the database layer.

Expected ownership model:

- `profiles.id` maps to the authenticated user's id.
- `sessions.user_id` maps to the authenticated user's id.
- Web reads and writes use the authenticated Supabase session.
- RLS prevents User B from reading or modifying User A data.

## Session Answer Formats

The platform currently supports multiple `answers_json` shapes.

Web-created Short Check-In shape:

```json
[
  {
    "prompt": "What are you trying to move forward?",
    "answer": "Set up the espresso machine"
  }
]
```

iOS-created dictionary-object shape:

```json
{
  "next_action": {
    "question_id": "next_action",
    "answer_value": "Get machine",
    "question_prompt": "What is the next small action?"
  }
}
```

Possible simple dictionary shape:

```json
{
  "current_focus": "Set up the espresso machine",
  "stuck_level": "2"
}
```

The web app normalizes these formats for display. For Short Check-In sessions, known question ids are ordered as:

1. `current_focus`
2. `stuck_level`
3. `main_blocker`
4. `next_action`
5. `ten_minute_action`

## Deployment

The web app is deployed as a Render static site. Production builds are created with:

```bash
npm run build
```

Render serves the generated static assets from the Vite build output.

