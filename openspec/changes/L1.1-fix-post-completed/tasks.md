# L1.1 Tasks (Option A — Add field)

- [ ] Add to `learn/models.py Post`:
      completed = models.BooleanField(default=False)
- [ ] Run `python manage.py makemigrations learn && python manage.py migrate`
- [ ] Verify badge renders correctly in the learn index
- [ ] Verify category filter for "Completed" and "Pending" returns correct posts
- [ ] Verify admin shows the completed checkbox on Post edit page
