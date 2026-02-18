# G2.2 Tasks

- [ ] Create `leaderboard` view in `practice/views.py`
      — queries `GameSession.objects.values('user').annotate(total=Sum('score')).order_by('-total')[:10]`
- [ ] Add route: `path('leaderboard/', views.leaderboard, name='leaderboard')`
- [ ] Build `practice/templates/practice/leaderboard.html` with a ranked table
- [ ] Add game-type filter (dropdown or tab) to the leaderboard
- [ ] Highlight the current user's row
- [ ] Add "Leaderboard" link to the practice page
- [ ] Test with multiple users and sessions
