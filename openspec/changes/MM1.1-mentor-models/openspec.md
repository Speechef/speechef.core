# MM1.1 — Mentorship Marketplace: Mentor + Booking Models

## Status: Unblocked

## Why
The mentorship marketplace requires a distinct data model from expert review. Mentors offer recurring sessions at their own rates, with calendar-based availability and a booking/payment flow. This is the data foundation everything else depends on.

## What

### MentorProfile model
```python
class MentorProfile(models.Model):
    user = OneToOneField(User)
    bio = TextField()
    credentials = TextField()
    specialties = ArrayField(CharField())      # ['IELTS', 'Public Speaking', 'Business English']
    languages = ArrayField(CharField())
    hourly_rate = DecimalField()
    intro_video_key = CharField(null=True)
    profile_photo = ImageField(null=True)
    timezone = CharField()                     # e.g. 'Asia/Kolkata'
    is_active = BooleanField(default=False)    # admin activates after review
    rating_avg = DecimalField(default=0)
    session_count = IntegerField(default=0)
    stripe_account_id = CharField(null=True)   # Stripe Connect for payouts
    created_at = DateTimeField(auto_now_add=True)
```

### MentorAvailability model
```python
class MentorAvailability(models.Model):
    DAYS = ['mon','tue','wed','thu','fri','sat','sun']
    mentor = ForeignKey(MentorProfile)
    day_of_week = CharField(choices=DAYS)
    start_time = TimeField()
    end_time = TimeField()
    # e.g. Monday 09:00–17:00 — slots generated dynamically per booking
```

### MentorSession model
```python
class MentorSession(models.Model):
    STATUS = ['pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show']
    mentor = ForeignKey(MentorProfile)
    student = ForeignKey(User)
    scheduled_at = DateTimeField()
    duration_minutes = IntegerField()          # 30 or 60
    status = CharField(choices=STATUS)
    price = DecimalField()
    stripe_payment_intent = CharField()
    meeting_url = CharField(null=True)         # Daily.co room URL
    recording_key = CharField(null=True)       # R2 key for session recording
    homework = TextField(blank=True)           # mentor assigns homework
    student_rating = IntegerField(null=True)   # 1-5
    student_review = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

### MentorBundle model
```python
class MentorBundle(models.Model):
    mentor = ForeignKey(MentorProfile)
    name = CharField()        # "5 Session Bundle"
    session_count = IntegerField()
    price = DecimalField()    # discounted vs individual sessions
    is_active = BooleanField(default=True)
```

### Admin
- MentorProfile: list with is_active toggle, rating_avg, stripe_account_id status
- MentorSession: list with status filter, scheduled_at, mentor, student
- MentorAvailability: inline on MentorProfile admin

## Files to Touch
- `backend/mentorship/models.py` (new app)
- `backend/mentorship/admin.py`
- `backend/mentorship/apps.py`
- `backend/speechef/settings/base.py`
- Migration

## Done When
- All models migrate cleanly
- Admin shows mentor list, session list, availability inline
- Can create a MentorProfile → add availability slots → create a session via admin
- MentorBundle created and linked to mentor correctly
