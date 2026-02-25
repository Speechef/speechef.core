# G8.1 — Practice Page "Resume Active Session" Banner

## Status: Unblocked

## Problem
If a user has an unfinished role play session (status = "active"), they have no way to discover and resume it from the practice hub. They'd need to navigate to the roleplay hub and find it manually.

## Solution
Add a persistent "resume" banner at the top of the practice page when the user has at least one active roleplay session. Calls `GET /roleplay/my/` (logged-in only), filters for `status = "active"`, shows the most recent one. Banner links to `/practice/roleplay/<mode>` to continue the conversation. Dismissed if no active sessions.

## Files
- `frontend/app/(games)/practice/page.tsx` (modified — add query + banner)
