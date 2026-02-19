# A1.3 — Games API Endpoints

## Status: Done

## Why
Expose game data and session submission via REST API for future mobile and
third-party clients.

## Endpoints
- `GET /api/v1/practice/question/` — Returns a random WordQuestion
- `POST /api/v1/practice/guess/` — Submit an answer for Guess the Word
- `GET /api/v1/practice/memory-match/` — Returns N random word/meaning pairs
- `GET /api/v1/practice/word-scramble/` — Returns a scrambled word
- `POST /api/v1/practice/word-scramble/check/` — Submit a scramble answer
- `GET /api/v1/practice/leaderboard/` — Top 10 users by score

## Acceptance Criteria
- [ ] All endpoints return proper JSON
- [ ] Game sessions recorded via API (authenticated users)
- [ ] Unauthenticated users can play but scores are not saved
