# G1.1 Tasks

- [x] Confirm `MemoryMatch` model fields from migration 0003 and sync `practice/models.py`
- [x] Create `memory_match` view in `practice/views.py` — serves 6 random word/meaning pairs as JSON context
- [x] Create `memory_match_result` view — accepts POST with attempt count, returns result page
- [x] Add routes to `practice/urls.py`:
      path('memory-match/', views.memory_match, name='memory_match')
- [x] Build `practice/templates/practice/memory_match.html` with card-flip CSS/JS
- [x] Build `practice/templates/practice/memory_match_result.html`
- [x] Update "Play Now" button for Memory Match in `practice/templates/practice/practice.html`
- [x] Register `MemoryMatch` in `practice/admin.py`
- [x] Test full game flow end-to-end
