# G1.2 Tasks

- [x] Confirm `WordScramble` model fields from migration 0003 and sync `practice/models.py`
- [x] Create `word_scramble` view — picks random word, scrambles letters, displays challenge
- [x] Result rendered inline via POST to same view, result template created
- [x] Routes in `practice/urls.py`: path('word-scramble/', views.word_scramble, name='word_scramble')
- [x] Build `practice/templates/practice/word_scramble.html` with a text input
- [x] Build `practice/templates/practice/word_scramble_result.html`
- [x] "Play Now" button for Word Scramble already wired in practice.html
- [x] Register `WordScramble` in `practice/admin.py`
- [x] Ensure scrambler always produces a different arrangement (retry if same)
- [x] Test full game flow end-to-end
