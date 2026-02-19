# B1.1 — Fix guess_the_word Empty Queryset Crash

## Status: Done

## Why
`practice/views.py:guess_the_word` calls `random.choice(WordQuestion.objects.all())`.
If the database has no WordQuestion entries, `random.choice()` raises an `IndexError`,
causing a 500 error for users.

## What
- Guard the view against empty querysets
- Redirect or show a friendly message if no questions exist
- Add a check before random.choice

## Acceptance Criteria
- [x] No 500 error when WordQuestion table is empty
- [x] User sees a meaningful message instead
- [x] Existing game flow unchanged when questions exist
