# G2.1 Tasks

- [ ] Add `GameSession` model to `practice/models.py`
- [ ] Create and run migration
- [ ] In each game result view, if `request.user.is_authenticated`, create a `GameSession`
- [ ] Register `GameSession` in `practice/admin.py`
- [ ] Add a `game_stats` context processor or helper used by the profile view
- [ ] Show "Games Played" and "Best Score per Game" on the user profile page
- [ ] Test: play game logged in → session recorded; play logged out → no session
