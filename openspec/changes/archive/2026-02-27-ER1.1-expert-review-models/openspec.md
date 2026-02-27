# ER1.1 — Expert Panel: Models + Admin

## Status: Done

## Why
Expert review is a premium feature that needs its own data model — separate from AI analysis. Experts are a distinct user type with profiles, and reviews are a workflow (submitted → assigned → in-review → delivered).

## What

### Expert model
```python
class Expert(models.Model):
    user = OneToOneField(User)
    bio = TextField()
    credentials = TextField()          # "CELTA certified, 10 years IELTS coaching"
    specialties = ArrayField(CharField())  # ['IELTS', 'Business English']
    languages = ArrayField(CharField())
    hourly_rate = DecimalField()
    intro_video_key = CharField(null=True)  # R2 key for intro video
    is_active = BooleanField(default=False) # toggled by admin after verification
    rating_avg = DecimalField(default=0)
    review_count = IntegerField(default=0)
    created_at = DateTimeField(auto_now_add=True)
```

### ExpertReview model
```python
class ExpertReview(models.Model):
    REVIEW_TYPES = ['general', 'ielts_speaking', 'job_interview', 'presentation']
    STATUS = ['submitted', 'assigned', 'in_review', 'delivered']

    user = ForeignKey(User)
    expert = ForeignKey(Expert, null=True)  # null until assigned
    analysis_session = ForeignKey(AnalysisSession, null=True)  # optional link
    video_key = CharField()               # R2 key for submitted video
    review_type = CharField(choices=REVIEW_TYPES)
    status = CharField(choices=STATUS, default='submitted')
    price_paid = DecimalField()
    stripe_payment_intent = CharField()
    submitted_at = DateTimeField(auto_now_add=True)
    deadline_at = DateTimeField()         # submitted_at + 48h
    delivered_at = DateTimeField(null=True)

    # Feedback (filled by expert)
    feedback_video_key = CharField(null=True)   # expert's recorded feedback
    feedback_notes = TextField(null=True)        # written notes
    feedback_rating = IntegerField(null=True)    # user rates the review (1-5)
```

### Admin
- `ExpertAdmin`: list display showing name, is_active, review_count, rating_avg
- `ExpertReviewAdmin`: list display with status filter, deadline countdown, assign expert action

## Files to Touch
- `backend/review/models.py` (new app)
- `backend/review/admin.py` (new)
- `backend/review/apps.py` (new)
- `backend/speechef/settings/base.py` — register app
- Migration

## Done When
- Both models migrate cleanly on Postgres
- Admin shows Expert list with is_active toggle
- Admin shows ExpertReview list filterable by status
- Can create an Expert and ExpertReview via admin without errors
