# B1.2 Tasks

- [ ] In `jobs/models.py`, change `job_rate = models.IntegerField(blank=True)` to `models.IntegerField(blank=True, null=True)`
- [ ] Run `python manage.py makemigrations jobs`
- [ ] Run `python manage.py migrate`
- [ ] Verify admin can save a job without a rate
