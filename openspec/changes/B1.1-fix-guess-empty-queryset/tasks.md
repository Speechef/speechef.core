# B1.1 Tasks

- [ ] In `practice/views.py`, check `WordQuestion.objects.exists()` before `random.choice`
- [ ] If no questions exist, render a template with a "No questions available" message
  OR redirect to `practice_index` with a flash message
- [ ] Add at least one WordQuestion via a data migration or fixture for testing
- [ ] Manually test: empty DB → friendly message; populated DB → game works
