# TP1.1 — Test Prep: Exam + Question Models

## Status: Done

## Why
Test prep (IELTS, TOEFL, PTE, OET, CELPIP, etc.) requires a flexible data model that can accommodate different exam structures, question types, and scoring bands. This foundation must be right before building API or frontend.

## What

### Exam model
```python
class Exam(models.Model):
    name = CharField()          # "IELTS Academic", "TOEFL iBT"
    slug = SlugField(unique=True)  # "ielts", "toefl"
    description = TextField()
    sections = ArrayField(CharField())  # ['Speaking', 'Writing', 'Listening', 'Reading']
    scoring_info = JSONField()   # band descriptions, score ranges
    logo = ImageField(null=True)
    is_active = BooleanField(default=True)
```

### ExamSection model
```python
class ExamSection(models.Model):
    exam = ForeignKey(Exam)
    name = CharField()           # "Speaking Part 1"
    slug = SlugField()
    duration_seconds = IntegerField()
    instructions = TextField()
    order = IntegerField()
```

### ExamQuestion model
```python
class ExamQuestion(models.Model):
    QUESTION_TYPES = [
        'multiple_choice', 'free_speech', 'fill_blank',
        'essay_prompt', 'listen_and_answer', 'read_and_respond'
    ]
    section = ForeignKey(ExamSection)
    question_type = CharField(choices=QUESTION_TYPES)
    prompt = TextField()
    audio_key = CharField(null=True)   # R2 key for listening questions
    image_key = CharField(null=True)   # R2 key for visual questions
    options = JSONField(null=True)     # for multiple choice
    correct_answer = TextField(null=True)  # null for free_speech / essay
    band_descriptors = JSONField(null=True)  # scoring rubric
    difficulty = CharField()           # easy / medium / hard
    order = IntegerField()
```

### ExamAttempt model
```python
class ExamAttempt(models.Model):
    user = ForeignKey(User)
    exam = ForeignKey(Exam)
    section = ForeignKey(ExamSection, null=True)  # null = full mock
    started_at = DateTimeField(auto_now_add=True)
    completed_at = DateTimeField(null=True)
    predicted_score = JSONField(null=True)  # {overall, per_section}
    answers = JSONField()  # list of {question_id, answer, ai_score}
```

### Admin + Seed Data
- Admin registration for all models
- Seed: at minimum 5 IELTS Speaking questions, 5 TOEFL questions
- Management command: `python manage.py seed_testprep`

## Files to Touch
- `backend/testprep/models.py` (new app)
- `backend/testprep/admin.py` (new)
- `backend/testprep/management/commands/seed_testprep.py` (new)
- `backend/speechef/settings/base.py`
- Migration

## Done When
- All models migrate cleanly
- Admin shows Exam → ExamSection → ExamQuestion hierarchy
- Seed command populates IELTS + TOEFL sections with real questions
- ExamAttempt created via admin with mock answers without error
