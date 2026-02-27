# FIX6.1 — Fix ProfileData Interface in Progress Page

## Problem
`frontend/app/(games)/progress/page.tsx` declares:
```ts
interface ProfileData {
  user: { id: number; username: string; email: string };
  current_streak: number;
  longest_streak: number;
}
```

But `GET /auth/profile/` uses `UserSerializer` which returns:
```json
{ "id": 1, "username": "alice", "email": "...", "profile": { "image": null, "current_streak": 5, "longest_streak": 10 } }
```

This causes two runtime silences:
1. `profile?.user?.username` — `user` key doesn't exist → renders nothing
2. `profile?.current_streak` — `current_streak` is nested under `profile.profile` → always `undefined`, so the streak pill never shows

## Solution
Fix the `ProfileData` interface to match the actual `UserSerializer` shape,
then update the two access expressions.

## Files Changed
| File | Change |
|------|--------|
| `frontend/app/(games)/progress/page.tsx` | Fix `ProfileData` interface; fix `.user?.username` → `.username`; fix `.current_streak` → `.profile?.current_streak` |

## No Backend Changes
`UserSerializer` already returns the correct shape.
