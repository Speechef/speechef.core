from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.conf import settings

from .models import RolePlaySession
from .serializers import RolePlaySessionSerializer, RolePlaySessionListSerializer

try:
    from openai import OpenAI
    _openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
except Exception:
    _openai_client = None


# ── System prompts per mode ──────────────────────────────────────────────────

SYSTEM_PROMPTS = {
    "job_interview": (
        "You are a professional interviewer conducting a {mode_label} interview for the role of {topic}. "
        "Ask realistic interview questions one at a time. Start with an intro and first question. "
        "After each user response, give a brief, encouraging acknowledgement (1 sentence), then ask the next question. "
        "Do NOT evaluate yet — just keep the conversation going naturally. "
        "Limit your turns to 2-3 sentences each."
    ),
    "presentation": (
        "You are a critical but supportive audience member watching a presentation about {topic}. "
        "The user is practising their presentation skills. Start by asking them to begin their pitch. "
        "After each response, ask a follow-up question or prompt them to elaborate on something. "
        "Keep your replies brief (1-2 sentences)."
    ),
    "debate": (
        "You are a skilled debater. The topic is: {topic}. Take the opposing side to the user. "
        "Make concise, logical counter-arguments (2-3 sentences) and challenge the user to respond. "
        "Start by stating your opening position."
    ),
    "small_talk": (
        "You are a friendly native English speaker practising casual conversation. "
        "The topic or setting is: {topic}. Keep responses natural, short (1-3 sentences), "
        "and occasionally ask a question to keep the conversation flowing."
    ),
}

MODE_LABELS = {
    "job_interview": "Job Interview",
    "presentation": "Presentation Pitch",
    "debate": "Debate",
    "small_talk": "Small Talk",
}

SCORE_PROMPT = (
    "You are an expert English communication coach. Below is a conversation transcript from a "
    "role-play exercise ({mode_label}, topic: {topic}).\n\n"
    "{transcript}\n\n"
    "Score the USER's communication out of 100, considering: clarity, vocabulary, fluency, confidence, "
    "relevance, grammar. Then provide exactly 3 actionable improvement tips.\n\n"
    "Respond in this JSON format:\n"
    "{{\"score\": <integer>, \"feedback\": \"<2-3 sentence summary>\", "
    "\"tips\": [\"tip1\", \"tip2\", \"tip3\"]}}"
)


def _gpt_reply(system_prompt: str, messages: list) -> str:
    if _openai_client is None:
        return "AI service unavailable. Please check your OpenAI configuration."
    try:
        resp = _openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt}] + messages,
            max_tokens=300,
            temperature=0.7,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        return f"(AI error: {e})"


def _score_session(session: RolePlaySession) -> dict:
    """Run GPT-4 scoring over the full transcript."""
    if _openai_client is None:
        return {"score": 0, "feedback": "AI scoring unavailable.", "tips": []}
    transcript_lines = []
    for t in session.turns:
        role = "Interviewer" if t["role"] == "assistant" else "You"
        transcript_lines.append(f"{role}: {t['content']}")
    transcript = "\n".join(transcript_lines)

    prompt = SCORE_PROMPT.format(
        mode_label=MODE_LABELS.get(session.mode, session.mode),
        topic=session.topic or "General",
        transcript=transcript,
    )
    try:
        resp = _openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.3,
        )
        import json
        raw = resp.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as e:
        return {"score": 50, "feedback": f"Scoring error: {e}", "tips": []}


# ── Views ────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_session(request):
    """Create a new role-play session and return the AI's opening message."""
    mode = request.data.get("mode", "job_interview")
    topic = request.data.get("topic", "").strip()

    if mode not in SYSTEM_PROMPTS:
        return Response({"detail": "Invalid mode."}, status=status.HTTP_400_BAD_REQUEST)

    system_prompt = SYSTEM_PROMPTS[mode].format(
        mode_label=MODE_LABELS.get(mode, mode),
        topic=topic or "General",
    )

    # Get opening message from AI
    opening = _gpt_reply(system_prompt, [])
    if not opening:
        opening = "Hello! Let's get started. Tell me about yourself."

    first_turn = {"role": "assistant", "content": opening, "timestamp": timezone.now().isoformat()}

    session = RolePlaySession.objects.create(
        user=request.user,
        mode=mode,
        topic=topic,
        turns=[first_turn],
    )

    return Response({
        "session_id": session.id,
        "opening_message": opening,
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_turn(request, pk):
    """User sends a message; AI replies."""
    try:
        session = RolePlaySession.objects.get(pk=pk, user=request.user)
    except RolePlaySession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

    if session.status == "finished":
        return Response({"detail": "Session is already finished."}, status=status.HTTP_400_BAD_REQUEST)

    user_text = request.data.get("message", "").strip()
    if not user_text:
        return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Append user turn
    now = timezone.now().isoformat()
    session.turns.append({"role": "user", "content": user_text, "timestamp": now})

    # Build system prompt and message history for AI
    system_prompt = SYSTEM_PROMPTS[session.mode].format(
        mode_label=MODE_LABELS.get(session.mode, session.mode),
        topic=session.topic or "General",
    )
    messages = [{"role": t["role"], "content": t["content"]} for t in session.turns]

    ai_reply = _gpt_reply(system_prompt, messages)
    session.turns.append({"role": "assistant", "content": ai_reply, "timestamp": timezone.now().isoformat()})
    session.save()

    return Response({"reply": ai_reply})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def finish_session(request, pk):
    """End the session and generate AI scoring."""
    try:
        session = RolePlaySession.objects.get(pk=pk, user=request.user)
    except RolePlaySession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

    if session.status == "finished":
        return Response(RolePlaySessionSerializer(session).data)

    session.status = "finished"
    session.finished_at = timezone.now()
    session.save()

    scoring = _score_session(session)

    session.score = scoring.get("score", 0)
    session.ai_feedback = scoring.get("feedback", "")
    session.tips = scoring.get("tips", [])
    session.save()

    try:
        from users.badges import award_badge
        award_badge(session.user, 'first_roleplay')
    except Exception:
        pass

    return Response({
        "session_id": session.id,
        "score": session.score,
        "feedback": session.ai_feedback,
        "tips": scoring.get("tips", []),
        "turns": session.turns,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_detail(request, pk):
    try:
        session = RolePlaySession.objects.get(pk=pk, user=request.user)
    except RolePlaySession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(RolePlaySessionSerializer(session).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_sessions(request):
    sessions = RolePlaySession.objects.filter(user=request.user)
    return Response(RolePlaySessionListSerializer(sessions, many=True).data)
