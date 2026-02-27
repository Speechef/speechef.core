# DB1.1 — Dashboard Game Stats Enhancement

## Status: Unblocked

## Problem
Dashboard only shows guess/memory/scramble in Game Stats and Quick Links. New games (vocabulary-blitz, sentence-builder, daily-challenge, roleplay) are invisible on the dashboard.

## Solution
- Expand `GAME_LABELS` / `GAME_HREFS` to include blitz, sentence, daily, and roleplay
- Update game type in `GameSession` interface to include all game keys
- Add Role Play sessions section (quick link) in the right sidebar
- Replace "Coming Soon" video section with a proper Activity Feed showing last 5 sessions across all game types

## Acceptance Criteria
- Game Stats grid shows all 6 game types
- Quick Links includes Vocabulary Blitz, Sentence Builder, Daily Challenge, AI Role Play
- Recent Games table shows correct label for all game types

## Files
- `frontend/app/(app)/dashboard/page.tsx` (modified)
