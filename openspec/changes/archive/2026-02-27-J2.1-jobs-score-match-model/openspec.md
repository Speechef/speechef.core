# J2.1 — Jobs Board: Score-Match Job Model + Employer Portal

## Status: Done

## Why
The existing jobs model is basic. To make the board a meaningful product feature, jobs must carry a minimum communication score requirement, and employers need a way to post and manage their listings.

## What

### Update existing Job model
Add to the existing `jobs.Job` model:
```python
min_speechef_score = IntegerField(null=True, blank=True)  # optional minimum score
required_languages = ArrayField(CharField(), default=list)
employment_type = CharField()  # full_time / part_time / contract / freelance
remote = BooleanField(default=False)
application_url = URLField(null=True, blank=True)  # external ATS or email
company_logo = ImageField(null=True)
is_featured = BooleanField(default=False)  # paid featured listing
posted_by = ForeignKey(User, null=True)    # employer user
```

### JobApplication model
```python
class JobApplication(models.Model):
    job = ForeignKey(Job)
    applicant = ForeignKey(User)
    applied_at = DateTimeField(auto_now_add=True)
    cover_note = TextField(blank=True)
    speechef_score_at_apply = IntegerField(null=True)  # snapshot of score
    status = CharField()  # applied / viewed / shortlisted / rejected
```

### Employer Profile model
```python
class EmployerProfile(models.Model):
    user = OneToOneField(User)
    company_name = CharField()
    company_website = URLField()
    company_size = CharField()
    industry = CharField()
    verified = BooleanField(default=False)  # admin verifies
```

### Admin
- Job admin: `min_speechef_score`, `is_featured`, `posted_by` filters
- JobApplication admin: status filter, applicant score column
- EmployerProfile admin: verified toggle

## Files to Touch
- `backend/jobs/models.py` — update Job, add JobApplication, EmployerProfile
- `backend/jobs/admin.py`
- Migration

## Done When
- Migration applies cleanly (including on existing Job rows)
- Admin shows min_speechef_score and company_logo on job list
- Can create a JobApplication with score snapshot via admin
- EmployerProfile can be created and verified via admin
