# G1.2 — Complete Word Scramble Game

## Status: Done

## Why
The Practice page shows a "Word Scramble" card that is a stub with no backend.
The migration `0003_memorymatch_wordscramble.py` includes a WordScramble model.

## What
- Add `WordScramble` model to `practice/models.py`
- Create view that picks a random word, scrambles its letters, and accepts typed guesses
- Add URL routes and templates
- Wire the "Play Now" button

## Game Logic
- Pick a random word from `WordQuestion`
- Scramble the letters (ensure scrambled != original)
- User types the correct word; submit to check
- Show result with the correct answer and option to try again

## Acceptance Criteria
- [x] Word Scramble accessible via URL
- [x] Scrambled word is always different from original
- [x] Correct/incorrect feedback shown
- [x] "Play Now" button on practice page navigates to the game
