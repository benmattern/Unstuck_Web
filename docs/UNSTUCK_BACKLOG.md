# Unstuck Backlog

## Architecture

### UN-ARCH-001 Standardize Session Answer Storage

Create one canonical `answers_json` shape for all clients. Current web display supports several shapes, but storage should be standardized to reduce parsing complexity and prevent client drift.

Acceptance direction:

- Define a canonical answer record shape.
- Migrate or normalize future writes from iOS and web.
- Keep backward-compatible rendering for historical sessions.

### UN-ARCH-002 Shared Form Definition System

Move question ids, prompts, order, answer types, and validation rules into a shared definition system used by both iOS and web.

Acceptance direction:

- Define Short Check-In form metadata once.
- Use the same question ids and order across clients.
- Reduce duplicated prompt strings.

### UN-ARCH-003 Canonical Form Engine Design

Design a reusable form engine for rendering, validating, storing, and reviewing Unstuck forms.

Acceptance direction:

- Support Short Check-In first.
- Allow future forms without bespoke page logic for every field.
- Preserve calm, action-oriented UX.

## Profile

### UN-PROFILE-001 Move Streak/Completed Today To Backend

Move streak and `completed_today` logic out of local app-only state and into backend-owned user/session-derived state.

Acceptance direction:

- Define source of truth for streak and daily completion.
- Ensure values are user-scoped.
- Make iOS and web display the same values.

## Notes

- Do not weaken RLS to solve client issues.
- Prefer database-backed user-scoped state over browser-local shared state for profile and preference data.
- Preserve backward compatibility for existing session records until storage is standardized.

