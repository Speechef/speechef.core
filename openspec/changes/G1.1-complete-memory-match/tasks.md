# G1.1 Tasks

- [ ] Confirm `MemoryMatch` model fields from migration 0003 and sync `practice/models.py`
- [ ] Create `memory_match` view in `practice/views.py` — serves 6 random word/meaning pairs as JSON context
- [ ] Create `memory_match_result` view — accepts POST with attempt count, returns result page
- [ ] Add routes to `practice/urls.py`:
      path('memory-match/', views.memory_match, name='memory_match')
      path('memory-match/result/', views.memory_match_result, name='memory_match_result')
- [ ] Build `practice/templates/practice/memory_match.html` with card-flip CSS/JS
- [ ] Build `practice/templates/practice/memory_match_result.html`
- [ ] Update "Play Now" button for Memory Match in `practice/templates/practice/practice.html`
- [ ] Register `MemoryMatch` in `practice/admin.py`
- [ ] Test full game flow end-to-end
