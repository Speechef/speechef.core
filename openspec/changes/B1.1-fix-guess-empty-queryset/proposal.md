# B1.1 — Fix guess_the_word Empty Queryset Crash

## Status: Unblocked

## Why
`practice/views.py:guess_the_word` calls `random.choice(WordQuestion.objects.all())`.
If the database has no WordQuestion entries, `random.choice()` raises an `IndexError`,
causing a 500 error for users.

## What
- Guard the view against empty querysets
- Redirect or show a friendly message if no questions exist
- Add a check before random.choice

## Acceptance Criteria
- [ ] No 500 error when WordQuestion table is empty
- [ ] User sees a meaningful message instead
- [ ] Existing game flow unchanged when questions exist
