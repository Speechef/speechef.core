# G1.1 — Complete Memory Match Game

## Status: Done

## Why
The Practice page shows a "Memory Match" card with a "Play Now" button that leads nowhere.
The migration `0003_memorymatch_wordscramble.py` created the model but views, URLs, and
templates need to be wired up.

## What
- Add `MemoryMatch` model to `practice/models.py` (sync with migration 0003)
- Create `memory_match` and `memory_match_result` views
- Add URL routes
- Wire the "Play Now" button on the practice page
- Display pairs of word ↔ meaning cards; user flips and matches them

## Game Logic
- Pick N random WordQuestion pairs (e.g., 6 pairs = 12 cards)
- Shuffle and display as a grid of face-down cards
- On two flips: if word matches meaning → keep revealed; else flip back
- Track attempts and time; show result on completion

## Acceptance Criteria
- [x] Memory Match accessible via URL
- [x] Cards display and flip correctly
- [x] Match/mismatch logic works
- [x] Result page shows attempts and score
- [x] "Play Now" button on practice page navigates to the game
