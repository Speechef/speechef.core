# B1.2 Tasks

- [x] In `jobs/models.py`, change `job_rate = models.IntegerField(blank=True)` to `models.IntegerField(blank=True, null=True)`
- [x] Run `python manage.py makemigrations jobs`
- [x] Run `python manage.py migrate`
- [x] Verify admin can save a job without a rate
