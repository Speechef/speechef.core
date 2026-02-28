import json
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import WritingSession, ResumeSession

try:
    from openai import OpenAI
    _client = OpenAI(api_key=settings.OPENAI_API_KEY)
except Exception:
    _client = None


WRITING_SYSTEM = (
    "You are an expert English writing coach. Analyse the provided text and return ONLY valid JSON "
    "with this exact shape:\n"
    '{"score": <int 0-100>, "band_score": <float e.g. 6.5>, '
    '"grammar_errors": [{"text": "...", "suggestion": "..."}], '
    '"vocabulary_rating": "Basic|Intermediate|Advanced", '
    '"vocabulary_suggestions": ["..."], '
    '"structure_feedback": "...", '
    '"coherence_feedback": "...", '
    '"improved_excerpt": "...", '
    '"narrative": "2-3 sentence coaching summary"}'
)

RESUME_SYSTEM = (
    "You are an expert resume coach and ATS specialist. Analyse the resume and return ONLY valid JSON "
    "with this exact shape:\n"
    '{"language_score": <int 0-100>, "ats_score": <int 0-100>, '
    '"top_issues": ["..."], '
    '"strong_phrases": ["..."], '
    '"weak_phrases": [{"original": "...", "suggestion": "..."}], '
    '"missing_keywords": ["..."], '
    '"narrative": "2-3 sentence summary"}'
)


def _parse_json_response(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_writing(request):
    text_type = request.data.get("text_type", "essay")
    input_text = request.data.get("text", "").strip()
    if not input_text:
        return Response({"detail": "text is required."}, status=status.HTTP_400_BAD_REQUEST)

    word_count = len(input_text.split())

    feedback = {}
    score = None

    if _client:
        try:
            user_msg = (
                f"Text type: {text_type}\n"
                f"Word count: {word_count}\n\n"
                f"Text:\n{input_text}"
            )
            resp = _client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": WRITING_SYSTEM},
                    {"role": "user", "content": user_msg},
                ],
                max_tokens=700,
                temperature=0.3,
            )
            feedback = _parse_json_response(resp.choices[0].message.content)
            score = feedback.get("score")
        except Exception as e:
            feedback = {"error": str(e), "narrative": "Analysis failed. Please try again."}

    session = WritingSession.objects.create(
        user=request.user,
        text_type=text_type,
        input_text=input_text,
        word_count=word_count,
        score=score,
        feedback=feedback,
    )
    return Response({"session_id": session.id, "feedback": feedback}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def writing_sessions(request):
    sessions = WritingSession.objects.filter(user=request.user)[:20]
    data = [
        {
            "id": s.id,
            "text_type": s.text_type,
            "word_count": s.word_count,
            "score": s.score,
            "created_at": s.created_at.isoformat(),
            "narrative": (s.feedback or {}).get("narrative", ""),
        }
        for s in sessions
    ]
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_resume(request):
    resume_text = request.data.get("resume_text", "").strip()
    target_role = request.data.get("target_role", "").strip()
    if not resume_text:
        return Response({"detail": "resume_text is required."}, status=status.HTTP_400_BAD_REQUEST)

    feedback = {}

    if _client:
        try:
            user_msg = (
                f"Target role: {target_role or 'Not specified'}\n\n"
                f"Resume:\n{resume_text}"
            )
            resp = _client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": RESUME_SYSTEM},
                    {"role": "user", "content": user_msg},
                ],
                max_tokens=600,
                temperature=0.3,
            )
            feedback = _parse_json_response(resp.choices[0].message.content)
        except Exception as e:
            feedback = {"error": str(e), "narrative": "Analysis failed. Please try again."}

    session = ResumeSession.objects.create(
        user=request.user,
        resume_text=resume_text,
        target_role=target_role,
        feedback=feedback,
    )
    return Response({"session_id": session.id, "feedback": feedback}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resume_sessions(request):
    sessions = ResumeSession.objects.filter(user=request.user)[:20]
    data = [
        {
            "id": s.id,
            "target_role": s.target_role,
            "created_at": s.created_at.isoformat(),
            "language_score": (s.feedback or {}).get("language_score"),
            "ats_score": (s.feedback or {}).get("ats_score"),
            "narrative": (s.feedback or {}).get("narrative", ""),
        }
        for s in sessions
    ]
    return Response(data)
