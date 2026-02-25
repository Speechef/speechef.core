from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import AnalysisSession
from .serializers import AnalysisSessionSerializer, AnalysisResultSerializer
from .tasks import process_media_upload


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_analysis(request):
    """Accept a media file upload, create session, queue processing."""
    file_obj = request.FILES.get("file")
    file_type = request.data.get("file_type", "audio")

    if not file_obj:
        return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

    if file_type not in ("audio", "video"):
        return Response({"detail": "file_type must be audio or video."}, status=status.HTTP_400_BAD_REQUEST)

    # Store file key (in production: upload to R2, store the key)
    file_key = f"uploads/{request.user.id}/{file_obj.name}"

    session = AnalysisSession.objects.create(
        user=request.user,
        file_key=file_key,
        file_type=file_type,
        status="pending",
    )

    # Queue Celery task
    process_media_upload.delay(session.id)

    return Response({"session_id": session.id, "status": "pending"}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_status(request, pk):
    """Poll for session processing status."""
    try:
        session = AnalysisSession.objects.get(pk=pk, user=request.user)
    except AnalysisSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        "session_id": session.id,
        "status": session.status,
        "completed_at": session.completed_at,
        "error": session.error,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_results(request, pk):
    """Fetch full analysis results for a completed session."""
    try:
        session = AnalysisSession.objects.get(pk=pk, user=request.user)
    except AnalysisSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
    if session.status != "done":
        return Response({"detail": "Analysis not yet complete.", "status": session.status}, status=status.HTTP_202_ACCEPTED)
    try:
        result = session.result
    except AnalysisSession.result.RelatedObjectDoesNotExist:
        return Response({"detail": "Results not available."}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        "session_id": session.id,
        "file_type": session.file_type,
        "created_at": session.created_at,
        "completed_at": session.completed_at,
        **AnalysisResultSerializer(result).data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_list(request):
    """List all analysis sessions for the current user."""
    sessions = AnalysisSession.objects.filter(user=request.user)[:20]
    return Response(AnalysisSessionSerializer(sessions, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def share_scorecard(request, pk):
    """Public endpoint: return a shareable summary for a completed session."""
    try:
        session = AnalysisSession.objects.get(pk=pk, status="done")
    except AnalysisSession.DoesNotExist:
        return Response({"detail": "Scorecard not available."}, status=status.HTTP_404_NOT_FOUND)

    try:
        result = session.result
    except AnalysisSession.result.RelatedObjectDoesNotExist:
        return Response({"detail": "Results not available."}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        "session_id": session.id,
        "username": session.user.username,
        "created_at": session.created_at,
        "file_type": session.file_type,
        "overall_score": result.overall_score,
        "fluency_score": result.fluency_score,
        "vocabulary_score": result.vocabulary_score,
        "pace_wpm": result.pace_wpm,
        "tone": result.tone,
        "narrative_feedback": result.narrative_feedback,
    })
