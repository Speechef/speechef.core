import json
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import InterviewSession

try:
    from openai import OpenAI
    _client = OpenAI(api_key=settings.OPENAI_API_KEY)
except Exception:
    _client = None

MODE_LABELS = {
    "behavioral": "Behavioral",
    "technical":  "Technical",
    "hr":         "HR / Competency",
    "mixed":      "Mixed",
}

DIFF_LABELS = {
    "easy":   "Entry Level",
    "medium": "Mid Level",
    "hard":   "Senior Level",
}

INTERVIEW_SYSTEM = (
    "You are a professional interviewer conducting a {mode_label} interview for a {difficulty_label} "
    "{role} position{company_ctx}. "
    "Ask realistic, role-appropriate interview questions one at a time. "
    "After each user answer, give brief, constructive feedback (1-2 sentences), a score from 0-10, "
    "and then ask the next question. "
    "Respond ONLY with valid JSON: "
    '{{"feedback": "...", "score": <int 0-10>, "ideal_answer": "...", "next_question": "...or null if done after 8 questions"}}'
)

SCORE_SYSTEM = (
    "You are an expert interview coach. Below is a full interview transcript for a {mode_label} "
    "{difficulty_label} {role} position.\n\n"
    "{transcript}\n\n"
    "Provide an overall assessment. Respond ONLY with valid JSON:\n"
    '{{"overall_score": <int 0-100>, "summary_feedback": "3-4 sentences", '
    '"strengths": ["...", "..."], "improvements": ["...", "..."]}}'
)


def _parse_json_response(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def _gpt_mini(system: str, messages: list) -> str:
    if _client is None:
        return '{"feedback": "AI unavailable.", "score": 5, "ideal_answer": "", "next_question": null}'
    resp = _client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": system}] + messages,
        max_tokens=300,
        temperature=0.5,
    )
    return resp.choices[0].message.content.strip()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_session(request):
    role         = request.data.get("role", "").strip()
    company_type = request.data.get("company_type", "").strip()
    mode         = request.data.get("mode", "behavioral")
    difficulty   = request.data.get("difficulty", "medium")

    if not role:
        return Response({"detail": "role is required."}, status=status.HTTP_400_BAD_REQUEST)
    if mode not in dict(InterviewSession.MODE_CHOICES):
        return Response({"detail": "Invalid mode."}, status=status.HTTP_400_BAD_REQUEST)

    company_ctx = f" at {company_type}" if company_type else ""
    system = INTERVIEW_SYSTEM.format(
        mode_label=MODE_LABELS.get(mode, mode),
        difficulty_label=DIFF_LABELS.get(difficulty, difficulty),
        role=role,
        company_ctx=company_ctx,
    )

    opening_question = "Could not generate question."
    if _client:
        try:
            resp = _client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": "Start the interview with a brief welcome and your first question."},
                ],
                max_tokens=200,
                temperature=0.6,
            )
            opening_question = resp.choices[0].message.content.strip()
        except Exception as e:
            opening_question = f"(Error: {e})"

    first_turn = {
        "role": "assistant",
        "content": opening_question,
        "ts": timezone.now().isoformat(),
    }

    session = InterviewSession.objects.create(
        user=request.user,
        role=role,
        company_type=company_type,
        mode=mode,
        difficulty=difficulty,
        turns=[first_turn],
    )
    return Response({
        "session_id": session.id,
        "opening_message": opening_question,
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def answer_turn(request, pk):
    try:
        session = InterviewSession.objects.get(pk=pk, user=request.user)
    except InterviewSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

    if session.status == "finished":
        return Response({"detail": "Session already finished."}, status=status.HTTP_400_BAD_REQUEST)

    answer = request.data.get("answer", "").strip()
    if not answer:
        return Response({"detail": "answer is required."}, status=status.HTTP_400_BAD_REQUEST)

    session.turns.append({"role": "user", "content": answer, "ts": timezone.now().isoformat()})

    company_ctx = f" at {session.company_type}" if session.company_type else ""
    system = INTERVIEW_SYSTEM.format(
        mode_label=MODE_LABELS.get(session.mode, session.mode),
        difficulty_label=DIFF_LABELS.get(session.difficulty, session.difficulty),
        role=session.role,
        company_ctx=company_ctx,
    )
    messages = [{"role": t["role"], "content": t["content"]} for t in session.turns]

    result = {"feedback": "Good answer.", "score": 5, "ideal_answer": "", "next_question": None}
    try:
        raw = _gpt_mini(system, messages)
        result = _parse_json_response(raw)
    except Exception as e:
        result["feedback"] = f"(Parse error: {e})"

    ai_turn = {
        "role": "assistant",
        "content": result.get("next_question") or "",
        "feedback": result.get("feedback", ""),
        "score": result.get("score", 5),
        "ideal_answer": result.get("ideal_answer", ""),
        "ts": timezone.now().isoformat(),
    }
    session.turns.append(ai_turn)
    session.save()

    return Response({
        "feedback":      result.get("feedback", ""),
        "score":         result.get("score", 5),
        "ideal_answer":  result.get("ideal_answer", ""),
        "next_question": result.get("next_question"),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def finish_session(request, pk):
    try:
        session = InterviewSession.objects.get(pk=pk, user=request.user)
    except InterviewSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

    if session.status == "finished":
        return Response({
            "overall_score":    session.overall_score,
            "summary_feedback": session.summary_feedback,
            "strengths":        session.strengths,
            "improvements":     session.improvements,
        })

    session.status = "finished"
    session.finished_at = timezone.now()
    session.save()

    scoring = {"overall_score": 50, "summary_feedback": "Session completed.", "strengths": [], "improvements": []}
    if _client:
        try:
            transcript_lines = []
            for t in session.turns:
                role_label = "Interviewer" if t["role"] == "assistant" else "Candidate"
                transcript_lines.append(f"{role_label}: {t['content']}")
            transcript = "\n".join(transcript_lines)

            prompt = SCORE_SYSTEM.format(
                mode_label=MODE_LABELS.get(session.mode, session.mode),
                difficulty_label=DIFF_LABELS.get(session.difficulty, session.difficulty),
                role=session.role,
                transcript=transcript,
            )
            resp = _client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
                temperature=0.3,
            )
            scoring = _parse_json_response(resp.choices[0].message.content)
        except Exception as e:
            scoring["summary_feedback"] = f"Scoring error: {e}"

    session.overall_score    = scoring.get("overall_score", 50)
    session.summary_feedback = scoring.get("summary_feedback", "")
    session.strengths        = scoring.get("strengths", [])
    session.improvements     = scoring.get("improvements", [])
    session.save()

    return Response({
        "overall_score":    session.overall_score,
        "summary_feedback": session.summary_feedback,
        "strengths":        session.strengths,
        "improvements":     session.improvements,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_sessions(request):
    sessions = InterviewSession.objects.filter(user=request.user)[:20]
    data = [
        {
            "id":            s.id,
            "role":          s.role,
            "mode":          s.mode,
            "difficulty":    s.difficulty,
            "status":        s.status,
            "overall_score": s.overall_score,
            "started_at":    s.started_at.isoformat(),
        }
        for s in sessions
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_detail(request, pk):
    try:
        session = InterviewSession.objects.get(pk=pk, user=request.user)
    except InterviewSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        "id":               session.id,
        "role":             session.role,
        "company_type":     session.company_type,
        "mode":             session.mode,
        "difficulty":       session.difficulty,
        "status":           session.status,
        "turns":            session.turns,
        "overall_score":    session.overall_score,
        "summary_feedback": session.summary_feedback,
        "strengths":        session.strengths,
        "improvements":     session.improvements,
        "started_at":       session.started_at.isoformat(),
        "finished_at":      session.finished_at.isoformat() if session.finished_at else None,
    })
