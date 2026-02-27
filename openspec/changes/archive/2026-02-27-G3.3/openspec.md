# G3.3 — Sentence Builder Game

## Status: Unblocked

## Summary
User sees a word + definition and must write a grammatically correct sentence using it.
GPT-4o-mini evaluates correctness and context. 5-round game, scored out of 50.

## Backend
- Add `POST /practice/sentence-check/` to practice/api_views.py
  - Body: { word, definition, sentence }
  - GPT-4o-mini judges: correct (true/false), feedback (1 sentence), score (0-10)
  - Returns: { correct, feedback, score }
- Add route to practice/api_urls.py

## Frontend
- `/practice/sentence-builder/page.tsx`
  - States: idle → playing → finished
  - 5 rounds per game
  - Each round: word shown with definition, textarea for sentence, submit
  - After submit: show score + GPT feedback, Next button
  - End: total score /50 + all rounds summary, save via guess_complete
