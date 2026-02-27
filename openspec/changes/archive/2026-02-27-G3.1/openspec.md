# G3.1 — Vocabulary Blitz Game

## Status: Unblocked

## Summary
Fast-paced 60-second vocabulary quiz. Questions auto-advance on correct answer.
Reuses existing `/practice/question/` and `/practice/guess/` APIs — no backend changes needed.

## Frontend
- `/practice/vocabulary-blitz/page.tsx`
  - States: idle → playing → finished
  - 60s countdown timer (goes red at ≤10s)
  - Word + 4 answer options as buttons
  - Correct → green flash → next question immediately
  - Wrong → red flash → next question after 0.5s
  - Score = correct answers in 60s
  - End: save via `POST /practice/guess/complete/`, show score card
- Add card to `/practice/page.tsx` word games section
