# G4.1 — Leaderboard Game Filter Enhancement

## Status: Unblocked

## Problem
The leaderboard filter tabs only show guess/memory/scramble. New games (blitz, sentence, daily, pronunciation) are missing from the filter, so their scores aren't visible on the leaderboard.

## Solution
Update `GAME_FILTERS` on the leaderboard page to include all 7 game types.

## Files
- `frontend/app/(games)/practice/leaderboard/page.tsx` (modified)
