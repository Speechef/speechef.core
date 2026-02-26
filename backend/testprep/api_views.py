from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Exam, ExamSection, ExamQuestion, ExamAttempt
from .serializers import (
    ExamSerializer, ExamListSerializer,
    ExamQuestionSerializer, ExamAttemptSerializer,
)


def _estimate_band(exam_slug, avg_score_0_to_10):
    """Convert 0–10 average score to an exam-specific band/level estimate."""
    if avg_score_0_to_10 is None:
        return None
    pct = avg_score_0_to_10 / 10.0  # normalise to 0–1

    if 'ielts' in exam_slug:
        raw = pct * 9
        band = round(raw * 2) / 2  # round to nearest 0.5
        return f"{band:.1f} band"
    elif 'toefl' in exam_slug:
        score = round(pct * 30)
        if score >= 24:
            level = "Advanced"
        elif score >= 18:
            level = "High-Intermediate"
        elif score >= 10:
            level = "Low-Intermediate"
        else:
            level = "Below Low-Intermediate"
        return f"{score}/30 — {level}"
    elif 'pte' in exam_slug:
        score = round(10 + pct * 70)
        return f"{score}/90"
    elif 'celpip' in exam_slug:
        level = round(pct * 12)
        return f"Level {level}/12"
    elif 'oet' in exam_slug:
        if pct >= 0.90:
            grade = "A"
        elif pct >= 0.75:
            grade = "B"
        elif pct >= 0.60:
            grade = "C"
        elif pct >= 0.45:
            grade = "D"
        else:
            grade = "E"
        return f"Grade {grade}"
    else:
        return f"{round(pct * 100)}%"


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def exam_list(request):
    exams = Exam.objects.filter(is_active=True)
    return Response(ExamListSerializer(exams, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def exam_detail(request, slug):
    try:
        exam = Exam.objects.get(slug=slug, is_active=True)
    except Exam.DoesNotExist:
        return Response({"detail": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(ExamSerializer(exam).data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def section_questions(request, exam_slug, section_slug):
    try:
        exam = Exam.objects.get(slug=exam_slug, is_active=True)
        section = ExamSection.objects.get(exam=exam, slug=section_slug)
    except (Exam.DoesNotExist, ExamSection.DoesNotExist):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    qs = section.questions.all()
    difficulty = request.query_params.get("difficulty")
    if difficulty:
        qs = qs.filter(difficulty=difficulty)

    return Response({
        "section": {
            "id": section.id,
            "name": section.name,
            "slug": section.slug,
            "instructions": section.instructions,
            "duration_seconds": section.duration_seconds,
        },
        "questions": ExamQuestionSerializer(qs, many=True).data,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def attempt_start(request):
    exam_slug = request.data.get("exam_slug")
    section_slug = request.data.get("section_slug")

    try:
        exam = Exam.objects.get(slug=exam_slug, is_active=True)
    except Exam.DoesNotExist:
        return Response({"detail": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

    section = None
    if section_slug:
        try:
            section = ExamSection.objects.get(exam=exam, slug=section_slug)
        except ExamSection.DoesNotExist:
            return Response({"detail": "Section not found."}, status=status.HTTP_404_NOT_FOUND)

    attempt = ExamAttempt.objects.create(
        user=request.user,
        exam=exam,
        section=section,
        answers=[],
    )
    return Response({"attempt_id": attempt.id}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def attempt_answer(request, pk):
    try:
        attempt = ExamAttempt.objects.get(pk=pk, user=request.user, completed_at__isnull=True)
    except ExamAttempt.DoesNotExist:
        return Response(
            {"detail": "Attempt not found or already completed."},
            status=status.HTTP_404_NOT_FOUND,
        )

    question_id = request.data.get("question_id")
    answer = request.data.get("answer", "")

    try:
        question = ExamQuestion.objects.get(pk=question_id)
    except ExamQuestion.DoesNotExist:
        return Response({"detail": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

    # Immediately score auto-gradable question types
    ai_score = None
    if question.question_type == "multiple_choice" and question.correct_answer:
        ai_score = 10 if answer.strip() == question.correct_answer.strip() else 0
    elif question.question_type == "fill_blank" and question.correct_answer:
        ai_score = 10 if answer.strip().lower() == question.correct_answer.strip().lower() else 0
    # free_speech / essay_prompt scored async (ai_score remains None)

    answers = attempt.answers or []
    answers.append({"question_id": question_id, "answer": answer, "ai_score": ai_score})
    attempt.answers = answers
    attempt.save(update_fields=["answers"])

    return Response({"saved": True, "scored": ai_score is not None, "ai_score": ai_score})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def attempt_complete(request, pk):
    try:
        attempt = ExamAttempt.objects.get(pk=pk, user=request.user, completed_at__isnull=True)
    except ExamAttempt.DoesNotExist:
        return Response(
            {"detail": "Attempt not found or already completed."},
            status=status.HTTP_404_NOT_FOUND,
        )

    answers = attempt.answers or []
    scored = [a for a in answers if a.get("ai_score") is not None]
    avg = sum(a["ai_score"] for a in scored) / len(scored) if scored else 0

    band_estimate = _estimate_band(attempt.exam.slug, avg) if scored else None

    attempt.completed_at = timezone.now()
    attempt.predicted_score = {
        "overall": round(avg, 1),
        "answered": len(answers),
        "scored": len(scored),
        "band_estimate": band_estimate,
    }
    attempt.save(update_fields=["completed_at", "predicted_score"])

    # Build per-question review for the results screen
    review = []
    question_ids = [a["question_id"] for a in answers]
    questions_map = {
        q.id: q for q in ExamQuestion.objects.filter(pk__in=question_ids)
    }
    for answer_data in answers:
        q = questions_map.get(answer_data["question_id"])
        if not q:
            continue
        show_correct = q.question_type in ("multiple_choice", "fill_blank")
        review.append({
            "question_id": q.id,
            "question_type": q.question_type,
            "prompt": q.prompt,
            "user_answer": answer_data["answer"],
            "correct_answer": q.correct_answer if show_correct else None,
            "is_correct": answer_data.get("ai_score") == 10 if show_correct else None,
            "ai_score": answer_data.get("ai_score"),
        })

    data = dict(ExamAttemptSerializer(attempt).data)
    data["review"] = review
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_attempts(request):
    attempts = ExamAttempt.objects.filter(user=request.user).order_by("-started_at")[:20]
    return Response(ExamAttemptSerializer(attempts, many=True).data)
