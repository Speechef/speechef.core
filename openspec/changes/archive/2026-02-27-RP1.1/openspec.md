# RP1.1 — Role Play Backend (Models + API)

## Status: Unblocked

## Summary
Create a `roleplay` Django app that powers AI-driven conversation simulations. The AI acts as an interviewer/debate partner/audience, the user responds. At the end, GPT-4 scores the session.

## Models
```python
class RolePlaySession(models.Model):
    MODE_CHOICES = [
        ("job_interview", "Job Interview"),
        ("presentation", "Presentation Pitch"),
        ("debate", "Debate"),
        ("small_talk", "Small Talk"),
    ]
    user = ForeignKey(User)
    mode = CharField(choices=MODE_CHOICES)
    topic = CharField(max_length=200, blank=True)   # e.g. "Software Engineer at Google"
    turns = JSONField(default=list)  # [{role, content, timestamp}]
    score = IntegerField(null=True)
    ai_feedback = TextField(blank=True)
    started_at = DateTimeField(auto_now_add=True)
    finished_at = DateTimeField(null=True)
    status = CharField(choices=[("active","Active"),("finished","Finished")], default="active")
```

## API Endpoints
- `POST /roleplay/start/` — create session, return first AI message
- `POST /roleplay/<id>/turn/` — user submits their response, AI replies; appends to turns
- `POST /roleplay/<id>/finish/` — end session, GPT-4 scores whole conversation, returns score + feedback
- `GET /roleplay/<id>/` — session detail
- `GET /roleplay/my/` — user's session history

## Files
- `backend/roleplay/models.py`
- `backend/roleplay/serializers.py`
- `backend/roleplay/api_views.py`
- `backend/roleplay/api_urls.py`
- `backend/roleplay/apps.py`
- `backend/speechef/api_urls.py` — add `path('roleplay/', include('roleplay.api_urls'))`
- `backend/speechef/settings.py` — add `roleplay` to INSTALLED_APPS
