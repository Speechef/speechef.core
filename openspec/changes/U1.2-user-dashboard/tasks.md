# U1.2 Tasks

- [ ] Update `home/views.py:home_index` to query:
      - `GameSession.objects.filter(user=request.user).order_by('-played_at')[:5]`
      - Per-game best scores via annotate
      - Streak from `request.user.profile`
- [ ] Update `home/templates/home/index.html`:
      - Replace hardcoded streak circles with dynamic data
      - Add "Recent Games" section replacing the placeholder video grid
      - Add stat cards (total games, best scores, streak)
      - Add "Recommended" card pointing to weakest game
      - Label "Upload Video" and "Experts" sections as "Coming Soon"
- [ ] Add `@login_required` to `home_index` if not already present
- [ ] Test as authenticated user vs anonymous user
