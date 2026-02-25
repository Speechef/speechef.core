# ST1.1 — Streak Risk Dashboard Banner

## Status: Unblocked

## Problem
Users with an active streak have no warning when they haven't completed any practice activity today, putting their streak at risk.

## Solution
On the dashboard, if `current_streak > 0` and the user has no game sessions today (checked client-side from the sessions data by comparing `played_at` to today's date), show a sticky amber warning banner at the top:
"🔥 Your X-day streak is at risk! Play a game or complete today's challenge to keep it alive."
Include a CTA button → /practice/daily-challenge.

This is frontend-only using data already loaded by the dashboard.

## Files
- `frontend/app/(app)/dashboard/page.tsx` (add StreakRiskBanner component + logic)
