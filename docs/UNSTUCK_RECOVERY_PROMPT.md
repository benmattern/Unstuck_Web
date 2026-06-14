# Unstuck Recovery Prompt

Use this prompt to resume work on Unstuck Web in a new AI/coding session.

```text
PROJECT: Unstuck Web

Current state:
- Web stack: React, TypeScript, Vite, Tailwind CSS, Supabase JS.
- Deployment: Render static site.
- Backend: Supabase project `unstuck_backend`.
- Supabase uses Auth, `profiles`, `sessions`, and RLS user isolation.

Important constraints:
- Do not change Supabase schema unless explicitly requested.
- Do not weaken or bypass RLS.
- Do not change auth flow unless explicitly requested.
- Preserve user isolation: User B must not see User A profile or sessions.
- Run `npm run build` after code changes.

Current web features:
- Sign in/out.
- Profile loading and display from `profiles`.
- Display name editing.
- User-scoped theme preference from `profiles.preferred_theme`.
- Supported themes: `system`, `light`, `dark`.
- Session history.
- New Short Check-In creation.
- Normalized answer display for web-created and iOS-created sessions.

Key files:
- `src/App.tsx`: app shell, auth-aware state, profile card, theme selector.
- `src/pages/SessionsPage.tsx`: session history and `answers_json` normalization.
- `src/pages/NewCheckInPage.tsx`: web Short Check-In creation.
- `src/services/sessionService.ts`: session fetch/create.
- `src/services/profileService.ts`: profile fetch/update.
- `src/types/session.ts`
- `src/types/profile.ts`

Known session answer formats:

Web-created:
[
  {
    "prompt": "What are you trying to move forward?",
    "answer": "Set up the espresso machine"
  }
]

iOS-created:
{
  "next_action": {
    "question_id": "next_action",
    "answer_value": "Get machine",
    "question_prompt": "What is the next small action?"
  }
}

Short Check-In display order:
1. current_focus
2. stuck_level
3. main_blocker
4. next_action
5. ten_minute_action

Current technical debt:
- UN-ARCH-001 Standardize session answer storage.
- UN-ARCH-002 Shared form definition system.
- UN-ARCH-003 Canonical form engine design.
- UN-PROFILE-001 Move streak/completed_today to backend.
```

