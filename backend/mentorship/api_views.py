from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Sum, Count
from django.utils import timezone
from .models import MentorProfile, MentorAvailability, MentorSession
from .serializers import (
    MentorListSerializer, MentorDetailSerializer,
    MentorSessionSerializer, MentorAvailabilitySerializer,
    MentorDashboardSessionSerializer, RecentStudentSerializer,
)


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def mentor_list(request):
    mentors = MentorProfile.objects.filter(is_active=True)
    specialty = request.query_params.get("specialty")
    language = request.query_params.get("language")
    if specialty:
        mentors = [m for m in mentors if specialty in (m.specialties or [])]
    elif language:
        mentors = [m for m in mentors if language in (m.languages or [])]
    return Response(MentorListSerializer(mentors, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def mentor_detail(request, pk):
    try:
        mentor = MentorProfile.objects.get(pk=pk, is_active=True)
    except MentorProfile.DoesNotExist:
        return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(MentorDetailSerializer(mentor).data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def mentor_availability(request, pk):
    """Return availability slots for a mentor on a given date."""
    try:
        mentor = MentorProfile.objects.get(pk=pk, is_active=True)
    except MentorProfile.DoesNotExist:
        return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)
    availability = mentor.availability.all()
    return Response(MentorAvailabilitySerializer(availability, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mentor_book(request, pk):
    """Book a session with a mentor. Returns a stub payment intent."""
    try:
        mentor = MentorProfile.objects.get(pk=pk, is_active=True)
    except MentorProfile.DoesNotExist:
        return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)

    scheduled_at = request.data.get("scheduled_at")
    duration = int(request.data.get("duration_minutes", 60))

    if not scheduled_at:
        return Response({"detail": "scheduled_at is required."}, status=status.HTTP_400_BAD_REQUEST)

    price = mentor.hourly_rate if duration == 60 else mentor.hourly_rate / 2

    session = MentorSession.objects.create(
        mentor=mentor,
        student=request.user,
        scheduled_at=scheduled_at,
        duration_minutes=duration,
        price=price,
        status="pending_payment",
        meeting_url="https://speechef.daily.co/session-placeholder",
    )

    # In production: create Stripe PaymentIntent here
    return Response({
        "session_id": session.id,
        "client_secret": "stub_secret_configure_stripe",
        "meeting_url": session.meeting_url,
        "price": str(price),
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_sessions(request):
    sessions = MentorSession.objects.filter(student=request.user).order_by("-scheduled_at")[:20]
    return Response(MentorSessionSerializer(sessions, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def rate_session(request, pk):
    try:
        session = MentorSession.objects.get(pk=pk, student=request.user, status="completed")
    except MentorSession.DoesNotExist:
        return Response({"detail": "Completed session not found."}, status=status.HTTP_404_NOT_FOUND)
    rating = request.data.get("rating")
    review = request.data.get("review", "")
    if not rating or not (1 <= int(rating) <= 5):
        return Response({"detail": "rating must be 1-5."}, status=status.HTTP_400_BAD_REQUEST)
    session.student_rating = int(rating)
    session.student_review = review
    session.save(update_fields=["student_rating", "student_review"])
    avg = MentorSession.objects.filter(mentor=session.mentor, student_rating__isnull=False).aggregate(avg=Avg("student_rating"))["avg"]
    if avg:
        session.mentor.rating_avg = round(avg, 2)
        session.mentor.save(update_fields=["rating_avg"])
    return Response({"saved": True})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def session_homework(request, pk):
    """Mentor posts homework for a session."""
    try:
        session = MentorSession.objects.get(pk=pk, mentor__user=request.user)
    except MentorSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
    session.homework = request.data.get("homework", "")
    session.save(update_fields=["homework"])
    return Response({"saved": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentor_dashboard(request):
    """Aggregated dashboard data for an active mentor."""
    try:
        mentor = MentorProfile.objects.get(user=request.user, is_active=True)
    except MentorProfile.DoesNotExist:
        return Response({"detail": "No active mentor profile found."}, status=status.HTTP_404_NOT_FOUND)

    now = timezone.now()
    today = now.date()

    # Upcoming confirmed sessions (future), ascending
    upcoming = (
        MentorSession.objects
        .filter(mentor=mentor, status="confirmed", scheduled_at__gt=now)
        .select_related("student")
        .order_by("scheduled_at")
    )

    # Today's confirmed sessions
    today_sessions = (
        MentorSession.objects
        .filter(mentor=mentor, status="confirmed", scheduled_at__date=today)
        .select_related("student")
        .order_by("scheduled_at")
    )

    # Stats
    completed = MentorSession.objects.filter(mentor=mentor, status="completed")
    total_sessions = completed.count()

    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_earnings = completed.filter(scheduled_at__gte=month_start).aggregate(
        total=Sum("price")
    )["total"] or 0

    # Recent students — last 5 unique students by most recent session
    seen = set()
    recent_students = []
    for s in MentorSession.objects.filter(mentor=mentor).select_related("student").order_by("-scheduled_at"):
        sid = s.student_id
        if sid in seen:
            continue
        seen.add(sid)
        u = s.student
        name = f"{u.first_name} {u.last_name}".strip() or u.username
        count = MentorSession.objects.filter(mentor=mentor, student=u).count()
        recent_students.append({
            "student_id": sid,
            "student_name": name,
            "student_initial": name[0].upper(),
            "last_session_at": s.scheduled_at,
            "session_count": count,
        })
        if len(recent_students) == 5:
            break

    return Response({
        "upcoming_sessions": MentorDashboardSessionSerializer(upcoming, many=True).data,
        "today_sessions": MentorDashboardSessionSerializer(today_sessions, many=True).data,
        "stats": {
            "total_sessions": total_sessions,
            "rating_avg": float(mentor.rating_avg),
            "monthly_earnings": float(monthly_earnings),
            "pending_payout": None,  # Stripe Connect not yet live
        },
        "recent_students": RecentStudentSerializer(recent_students, many=True).data,
    })
