# U1.1 Tasks

- [ ] Add `current_streak`, `longest_streak`, `last_played_date` to `users/models.py Profile`
- [ ] Create and run migration
- [ ] Add `update_streak(user)` helper in `practice/utils.py`
      — call this after each `GameSession` is created
- [ ] Update `home/views.py` to pass streak data to the template context
- [ ] Replace hardcoded streak circles in `home/templates/home/index.html` with dynamic data
      — render filled/empty circles based on `current_streak` (cap at 7)
- [ ] Test: play on day 1 → streak=1; play on day 2 → streak=2; skip day → streak=1
