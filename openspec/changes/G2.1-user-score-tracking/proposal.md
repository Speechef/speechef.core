# G2.1 — User Score Tracking

## Status: Done

## Why
There is currently no way to track a user's game history, scores, or progress.
The Home dashboard has a hardcoded "Daily Streak" UI with no real data behind it.

## What
- Add a `GameSession` model linking a User to a game, score, and timestamp
- Record a session each time a user completes Guess the Word, Memory Match, or Word Scramble
- Expose per-user stats (total games, best scores, recent activity)

## Model Design
```python
class GameSession(models.Model):
    GAME_CHOICES = [
        ('guess', 'Guess the Word'),
        ('memory', 'Memory Match'),
        ('scramble', 'Word Scramble'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.CharField(max_length=20, choices=GAME_CHOICES)
    score = models.IntegerField(default=0)
    played_at = models.DateTimeField(auto_now_add=True)
```

## Acceptance Criteria
- [x] GameSession saved after each completed game (logged-in users only)
- [x] Admin can view all sessions
- [x] User profile shows games played count and best scores
