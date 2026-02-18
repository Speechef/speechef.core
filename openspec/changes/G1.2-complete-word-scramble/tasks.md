# G1.2 Tasks

- [ ] Confirm `WordScramble` model fields from migration 0003 and sync `practice/models.py`
- [ ] Create `word_scramble` view — picks random word, scrambles letters, displays challenge
- [ ] Create `word_scramble_result` view — checks typed answer, returns result
- [ ] Add routes to `practice/urls.py`:
      path('word-scramble/', views.word_scramble, name='word_scramble')
      path('word-scramble/result/', views.word_scramble_result, name='word_scramble_result')
- [ ] Build `practice/templates/practice/word_scramble.html` with a text input
- [ ] Build `practice/templates/practice/word_scramble_result.html`
- [ ] Update "Play Now" button for Word Scramble in `practice/templates/practice/practice.html`
- [ ] Register `WordScramble` in `practice/admin.py`
- [ ] Ensure scrambler always produces a different arrangement (retry if same)
- [ ] Test full game flow end-to-end
