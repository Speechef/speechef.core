# RP2.1 — Role Play Per-Mode Performance Stats

## Status: Unblocked

## Problem
The Role Play hub lists past sessions but shows no aggregate performance insights — users can't see which mode they perform best in or their average score.

## Solution
Add a "Your Stats" section below the mode cards on the roleplay hub page. Using the already-loaded sessions data, compute per-mode: session count, average score, and best score. Display as a 4-column stat grid with score bars.

## Files
- `frontend/app/(games)/practice/roleplay/page.tsx` (modified)
