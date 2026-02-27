import hashlib
import hmac
import logging
from datetime import timedelta

from django.conf import settings
from django.db.models import Avg, Sum
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import (
    MentorProfile, MentorAvailability, MentorBundle, MentorSession,
    MentorUnavailability, UserBundle, MentorStudentNote,
)
from .serializers import (
    MentorListSerializer, MentorDetailSerializer,
    MentorSessionSerializer, MentorAvailabilitySerializer,
    MentorDashboardSessionSerializer, RecentStudentSerializer,
    MentorUnavailabilitySerializer, UserBundleSerializer,
    MentorStudentNoteSerializer,
)

logger = logging.getLogger(__name__)


# ── Helpers ────────────────────────────────────────────────────────────────

def _mentor_name(mentor):
    u = mentor.user
    return f"{u.first_name} {u.last_name}".strip() or u.username


def _get_active_mentor(user):
    """Return the active MentorProfile for user, or None."""
    try:
        return MentorProfile.objects.get(user=user, is_active=True)
    except MentorProfile.DoesNotExist:
        return None


# ── Public listing & detail ────────────────────────────────────────────────

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
    serializer = MentorDetailSerializer(mentor, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def mentor_availability(request, pk):
    """Return availability slots, accounting for unavailability blocks. MM7.1"""
    try:
        mentor = MentorProfile.objects.get(pk=pk, is_active=True)
    except MentorProfile.DoesNotExist:
        return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)

    date_str = request.query_params.get("date")
    blocked = False
    if date_str:
        from datetime import date as date_type
        try:
            import datetime
            query_date = datetime.date.fromisoformat(date_str)
            blocked = MentorUnavailability.objects.filter(
                mentor=mentor,
                start_date__lte=query_date,
                end_date__gte=query_date,
            ).exists()
        except ValueError:
            pass

    # User bundle info
    user_bundle = None
    if request.user.is_authenticated:
        ub = UserBundle.objects.filter(
            user=request.user, mentor=mentor,
            sessions_remaining__gt=0,
            expires_at__gt=timezone.now(),
        ).first()
        if ub:
            user_bundle = {
                "id": ub.id,
                "sessions_remaining": ub.sessions_remaining,
                "expires_at": ub.expires_at,
            }

    availability = mentor.availability.all()
    return Response({
        "slots": MentorAvailabilitySerializer(availability, many=True).data,
        "blocked": blocked,
        "user_bundle": user_bundle,
    })


# ── Booking ────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mentor_book(request, pk):
    """Book a session. Supports bundle credits (MM4.2) and free intro (MM8.1)."""
    try:
        mentor = MentorProfile.objects.get(pk=pk, is_active=True)
    except MentorProfile.DoesNotExist:
        return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)

    scheduled_at = request.data.get("scheduled_at")
    duration = int(request.data.get("duration_minutes", 60))
    is_intro = request.data.get("is_intro", False)
    bundle_id = request.data.get("bundle_id")

    if not scheduled_at:
        return Response({"detail": "scheduled_at is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Intro call validation (MM8.1)
    if is_intro:
        if not mentor.offers_intro_call:
            return Response({"detail": "This mentor does not offer intro calls."}, status=status.HTTP_400_BAD_REQUEST)
        if MentorSession.objects.filter(mentor=mentor, student=request.user).exists():
            return Response({"detail": "You have already had a session with this mentor."}, status=status.HTTP_400_BAD_REQUEST)
        session = MentorSession.objects.create(
            mentor=mentor, student=request.user,
            scheduled_at=scheduled_at, duration_minutes=15,
            price=0, status="confirmed",
            meeting_url="https://speechef.daily.co/intro-placeholder",
        )
        return Response({"session_id": session.id, "meeting_url": session.meeting_url}, status=status.HTTP_201_CREATED)

    # Bundle credit booking (MM4.2)
    if bundle_id:
        try:
            ub = UserBundle.objects.get(
                id=bundle_id, user=request.user, mentor=mentor,
                sessions_remaining__gt=0, expires_at__gt=timezone.now(),
            )
        except UserBundle.DoesNotExist:
            return Response({"detail": "Bundle not found or no sessions remaining."}, status=status.HTTP_400_BAD_REQUEST)
        session = MentorSession.objects.create(
            mentor=mentor, student=request.user,
            scheduled_at=scheduled_at, duration_minutes=duration,
            price=0, status="confirmed",
            meeting_url="https://speechef.daily.co/session-placeholder",
        )
        from django.db.models import F
        ub.sessions_remaining = F("sessions_remaining") - 1
        ub.save(update_fields=["sessions_remaining"])
        return Response({"session_id": session.id, "meeting_url": session.meeting_url}, status=status.HTTP_201_CREATED)

    # Standard paid booking
    price = mentor.hourly_rate if duration == 60 else mentor.hourly_rate / 2
    session = MentorSession.objects.create(
        mentor=mentor, student=request.user,
        scheduled_at=scheduled_at, duration_minutes=duration,
        price=price, status="pending_payment",
        meeting_url="https://speechef.daily.co/session-placeholder",
    )
    return Response({
        "session_id": session.id,
        "client_secret": "stub_secret_configure_stripe",
        "meeting_url": session.meeting_url,
        "price": str(price),
    }, status=status.HTTP_201_CREATED)


# ── Student sessions ───────────────────────────────────────────────────────

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


# ── Cancellation (MM6.1) ───────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_session(request, pk):
    """Cancel a confirmed future session with refund calculation."""
    try:
        session = MentorSession.objects.select_related("mentor__user", "student").get(pk=pk)
    except MentorSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

    # Auth: only the session's student or mentor can cancel
    is_student = session.student == request.user
    is_mentor = hasattr(request.user, "mentor_profile") and session.mentor == request.user.mentor_profile
    if not is_student and not is_mentor:
        return Response({"detail": "Not authorised."}, status=status.HTTP_403_FORBIDDEN)

    if session.status != "confirmed":
        return Response({"detail": "Only confirmed sessions can be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    if session.scheduled_at <= now:
        return Response({"detail": "Session has already started."}, status=status.HTTP_400_BAD_REQUEST)

    hours_until = (session.scheduled_at - now).total_seconds() / 3600

    # Refund policy
    if is_mentor:
        refund_pct = 1.0
    elif hours_until > 24:
        refund_pct = 1.0
    else:
        refund_pct = 0.5

    refund_amount = float(session.price) * refund_pct

    session.status = "cancelled"
    session.cancelled_by = "mentor" if is_mentor else "student"
    session.cancelled_at = now
    session.cancellation_reason = request.data.get("reason", "")
    session.refund_amount = refund_amount
    session.save(update_fields=["status", "cancelled_by", "cancelled_at", "cancellation_reason", "refund_amount"])

    # Stripe refund would go here in production
    return Response({
        "cancelled": True,
        "refund_amount": refund_amount,
        "refund_pct": int(refund_pct * 100),
    })


# ── Mentor homework ────────────────────────────────────────────────────────

@api_view(["POST", "PATCH"])
@permission_classes([IsAuthenticated])
def session_homework(request, pk):
    """Mentor posts or updates homework for a session. MM2.2"""
    try:
        session = MentorSession.objects.get(pk=pk, mentor__user=request.user)
    except MentorSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
    session.homework = request.data.get("homework", "")
    session.save(update_fields=["homework"])
    return Response({"saved": True, "homework": session.homework})


# ── Mentor review reply (MM9.1) ────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def session_reply(request, pk):
    """Mentor posts a one-time reply to a student review."""
    try:
        session = MentorSession.objects.get(pk=pk, mentor__user=request.user)
    except MentorSession.DoesNotExist:
        return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)
    if not session.student_review:
        return Response({"detail": "No review to reply to yet."}, status=status.HTTP_400_BAD_REQUEST)
    if session.mentor_reply:
        return Response({"detail": "You have already replied to this review."}, status=status.HTTP_400_BAD_REQUEST)
    reply = request.data.get("reply", "").strip()
    if not reply:
        return Response({"detail": "reply is required."}, status=status.HTTP_400_BAD_REQUEST)
    if len(reply) > 500:
        return Response({"detail": "Reply must be 500 characters or fewer."}, status=status.HTTP_400_BAD_REQUEST)
    session.mentor_reply = reply
    session.mentor_replied_at = timezone.now()
    session.save(update_fields=["mentor_reply", "mentor_replied_at"])
    return Response({"saved": True})


# ── Mentor dashboard (MM2.1) ───────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentor_dashboard(request):
    mentor = _get_active_mentor(request.user)
    if not mentor:
        return Response({"detail": "No active mentor profile found."}, status=status.HTTP_404_NOT_FOUND)

    now = timezone.now()
    today = now.date()

    upcoming = (
        MentorSession.objects
        .filter(mentor=mentor, status="confirmed", scheduled_at__gt=now)
        .select_related("student")
        .order_by("scheduled_at")
    )
    today_sessions = (
        MentorSession.objects
        .filter(mentor=mentor, status="confirmed", scheduled_at__date=today)
        .select_related("student")
        .order_by("scheduled_at")
    )

    completed = MentorSession.objects.filter(mentor=mentor, status="completed")
    total_sessions = completed.count()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_earnings = completed.filter(scheduled_at__gte=month_start).aggregate(total=Sum("price"))["total"] or 0

    seen, recent_students = set(), []
    for s in MentorSession.objects.filter(mentor=mentor).select_related("student").order_by("-scheduled_at"):
        sid = s.student_id
        if sid in seen:
            continue
        seen.add(sid)
        u = s.student
        name = f"{u.first_name} {u.last_name}".strip() or u.username
        count = MentorSession.objects.filter(mentor=mentor, student=u).count()
        recent_students.append({
            "student_id": sid, "student_name": name,
            "student_initial": name[0].upper(),
            "last_session_at": s.scheduled_at, "session_count": count,
        })
        if len(recent_students) == 5:
            break

    # Rated sessions for reviews tab (MM9.1)
    rated_sessions = (
        MentorSession.objects
        .filter(mentor=mentor, student_rating__isnull=False)
        .select_related("student")
        .order_by("-scheduled_at")
    )

    # Recent completed sessions for homework tab (MM2.2)
    recent_completed = (
        MentorSession.objects
        .filter(mentor=mentor, status="completed")
        .select_related("student")
        .order_by("-scheduled_at")[:10]
    )

    return Response({
        "upcoming_sessions": MentorDashboardSessionSerializer(upcoming, many=True).data,
        "today_sessions": MentorDashboardSessionSerializer(today_sessions, many=True).data,
        "rated_sessions": MentorDashboardSessionSerializer(rated_sessions, many=True).data,
        "recent_completed": MentorDashboardSessionSerializer(recent_completed, many=True).data,
        "stats": {
            "total_sessions": total_sessions,
            "rating_avg": float(mentor.rating_avg),
            "monthly_earnings": float(monthly_earnings),
            "pending_payout": None,
        },
        "recent_students": RecentStudentSerializer(recent_students, many=True).data,
    })


# ── Mentor earnings (MM2.3) ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mentor_earnings(request):
    mentor = _get_active_mentor(request.user)
    if not mentor:
        return Response({"detail": "No active mentor profile found."}, status=status.HTTP_404_NOT_FOUND)

    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    completed = MentorSession.objects.filter(mentor=mentor, status="completed")

    monthly = completed.filter(scheduled_at__gte=month_start).aggregate(total=Sum("price"))["total"] or 0
    all_time = completed.aggregate(total=Sum("price"))["total"] or 0
    platform_fee_pct = 0.15

    # Monthly breakdown — last 12 months
    monthly_breakdown = []
    for i in range(11, -1, -1):
        d = now - timedelta(days=30 * i)
        m_start = d.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if i == 0:
            m_end = now
        else:
            next_month = (m_start.replace(day=28) + timedelta(days=4)).replace(day=1)
            m_end = next_month
        gross = completed.filter(scheduled_at__gte=m_start, scheduled_at__lt=m_end).aggregate(total=Sum("price"))["total"] or 0
        session_count = completed.filter(scheduled_at__gte=m_start, scheduled_at__lt=m_end).count()
        monthly_breakdown.append({
            "month": m_start.strftime("%b %Y"),
            "gross": float(gross),
            "fee": round(float(gross) * platform_fee_pct, 2),
            "net": round(float(gross) * (1 - platform_fee_pct), 2),
            "session_count": session_count,
        })

    # Session breakdown (most recent 50)
    sessions = completed.select_related("student").order_by("-scheduled_at")[:50]
    session_rows = []
    for s in sessions:
        u = s.student
        name = f"{u.first_name} {u.last_name}".strip() or u.username
        gross = float(s.price)
        session_rows.append({
            "id": s.id,
            "student_name": name,
            "scheduled_at": s.scheduled_at,
            "duration_minutes": s.duration_minutes,
            "gross": gross,
            "fee": round(gross * platform_fee_pct, 2),
            "net": round(gross * (1 - platform_fee_pct), 2),
        })

    return Response({
        "summary": {
            "monthly_gross": float(monthly),
            "monthly_fee": round(float(monthly) * platform_fee_pct, 2),
            "monthly_net": round(float(monthly) * (1 - platform_fee_pct), 2),
            "all_time_gross": float(all_time),
            "all_time_net": round(float(all_time) * (1 - platform_fee_pct), 2),
            "pending_payout": None,
        },
        "monthly_breakdown": monthly_breakdown,
        "sessions": session_rows,
    })


# ── Availability overrides (MM7.1) ────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def unavailability_list(request):
    mentor = _get_active_mentor(request.user)
    if not mentor:
        return Response({"detail": "No active mentor profile found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        blocks = MentorUnavailability.objects.filter(mentor=mentor, end_date__gte=timezone.now().date())
        return Response(MentorUnavailabilitySerializer(blocks, many=True).data)

    # POST — create a block
    serializer = MentorUnavailabilitySerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    start = serializer.validated_data["start_date"]
    end = serializer.validated_data["end_date"]

    # Check for conflicting confirmed sessions
    conflicts = MentorSession.objects.filter(
        mentor=mentor, status="confirmed",
        scheduled_at__date__gte=start, scheduled_at__date__lte=end,
    )
    if conflicts.exists():
        return Response({
            "detail": "Conflicting confirmed sessions exist on these dates.",
            "conflicts": [{"id": s.id, "scheduled_at": s.scheduled_at} for s in conflicts],
        }, status=status.HTTP_409_CONFLICT)

    block = MentorUnavailability.objects.create(mentor=mentor, **serializer.validated_data)
    return Response(MentorUnavailabilitySerializer(block).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def unavailability_detail(request, pk):
    mentor = _get_active_mentor(request.user)
    if not mentor:
        return Response({"detail": "No active mentor profile found."}, status=status.HTTP_404_NOT_FOUND)
    try:
        block = MentorUnavailability.objects.get(pk=pk, mentor=mentor)
    except MentorUnavailability.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    block.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ── Bundle purchase (MM4.1) ────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bundle_purchase(request, pk, bundle_id):
    """Initiate bundle purchase. Returns Stripe Checkout stub."""
    try:
        mentor = MentorProfile.objects.get(pk=pk, is_active=True)
        bundle = MentorBundle.objects.get(pk=bundle_id, mentor=mentor, is_active=True)
    except (MentorProfile.DoesNotExist, MentorBundle.DoesNotExist):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    # In production: create Stripe Checkout Session here
    # stripe.checkout.Session.create(line_items=[...], metadata={mentor_id, bundle_id, user_id})
    return Response({
        "checkout_url": f"/mentors/bundles/success?bundle_id={bundle_id}&mentor_id={pk}",
        "stub": True,
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bundle_confirm(request):
    """Confirm a bundle purchase (called after Stripe Checkout success). MM4.1"""
    bundle_id = request.data.get("bundle_id")
    mentor_id = request.data.get("mentor_id")
    try:
        bundle = MentorBundle.objects.get(pk=bundle_id, is_active=True)
        mentor = MentorProfile.objects.get(pk=mentor_id, is_active=True)
    except (MentorBundle.DoesNotExist, MentorProfile.DoesNotExist):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    ub = UserBundle.objects.create(
        user=request.user,
        bundle=bundle,
        mentor=mentor,
        sessions_remaining=bundle.session_count,
        expires_at=timezone.now() + timedelta(days=365),
    )
    return Response(UserBundleSerializer(ub).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bundles(request):
    bundles = UserBundle.objects.filter(
        user=request.user,
        sessions_remaining__gt=0,
        expires_at__gt=timezone.now(),
    ).select_related("bundle", "mentor__user")
    return Response(UserBundleSerializer(bundles, many=True).data)


# ── Smart matching (MM5.1) ────────────────────────────────────────────────

DIMENSION_TO_SPECIALTY = {
    "fluency":       ["Fluency", "Conversation", "IELTS Speaking"],
    "grammar":       ["Grammar", "Business English", "Academic Writing"],
    "pace":          ["Public Speaking", "Presentation Skills"],
    "pronunciation": ["Pronunciation", "Accent Reduction"],
    "vocabulary":    ["Vocabulary", "IELTS", "TOEFL"],
}


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def recommended_mentors(request):
    """Return up to 3 mentors matched to the user's weak dimensions. MM5.1"""
    mentors = list(MentorProfile.objects.filter(is_active=True).order_by("-rating_avg", "-session_count"))

    if not request.user.is_authenticated:
        data = MentorListSerializer(mentors[:3], many=True).data
        for item in data:
            item["match_reason"] = None
        return Response(data)

    # Find user's latest analysis result
    try:
        from analysis.models import AnalysisSession
        latest = AnalysisSession.objects.filter(
            user=request.user, status="done", result__isnull=False
        ).order_by("-created_at").first()
    except Exception:
        latest = None

    if not latest or not latest.result:
        data = MentorListSerializer(mentors[:3], many=True).data
        for item in data:
            item["match_reason"] = None
        return Response(data)

    result = latest.result
    scores = {
        "fluency":       result.get("fluency_score", 100),
        "grammar":       result.get("grammar_score", 100),
        "pace":          result.get("pace_score", 100),
        "pronunciation": result.get("pronunciation_score", 100),
        "vocabulary":    result.get("vocabulary_score", 100),
    }
    # Sort by weakest dimensions
    weak_dims = sorted(scores.items(), key=lambda x: x[1])[:2]
    target_specialties = []
    for dim, _ in weak_dims:
        target_specialties.extend(DIMENSION_TO_SPECIALTY.get(dim, []))

    results = []
    for m in mentors:
        match = next((s for s in (m.specialties or []) if s in target_specialties), None)
        if match:
            dim_label = next(
                (d for d, specs in DIMENSION_TO_SPECIALTY.items() if match in specs), None
            )
            reason = f"Specialises in {dim_label} improvement" if dim_label else f"Matches your {match} goal"
            results.append((m, reason))
        if len(results) == 3:
            break

    # Pad with top-rated if fewer than 3 matches
    if len(results) < 3:
        matched_ids = {m.id for m, _ in results}
        for m in mentors:
            if m.id not in matched_ids:
                results.append((m, None))
            if len(results) == 3:
                break

    out = []
    for m, reason in results:
        item = MentorListSerializer(m).data
        item["match_reason"] = reason
        out.append(item)
    return Response(out)


# ── Recording (MM3.1) ─────────────────────────────────────────────────────

@api_view(["POST"])
def daily_webhook(request):
    """Handle Daily.co webhook events (recording.ready). MM3.1"""
    secret = getattr(settings, "DAILY_WEBHOOK_HMAC_SECRET", "")
    if secret:
        sig = request.headers.get("X-Daily-Signature", "")
        expected = hmac.new(secret.encode(), request.body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return Response({"detail": "Invalid signature."}, status=status.HTTP_401_UNAUTHORIZED)

    event_type = request.data.get("type")
    if event_type == "recording.ready":
        session_id = request.data.get("session_id")
        recording_url = request.data.get("recording", {}).get("download_url")
        if session_id and recording_url:
            from .tasks import fetch_and_store_recording
            fetch_and_store_recording.delay(session_id, recording_url)
    return Response({"received": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_recording(request, pk):
    """Return a pre-signed R2 URL for a session recording. MM3.2"""
    try:
        session = MentorSession.objects.get(pk=pk)
    except MentorSession.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    is_student = session.student == request.user
    is_mentor = hasattr(request.user, "mentor_profile") and session.mentor == request.user.mentor_profile
    if not is_student and not is_mentor:
        return Response({"detail": "Not authorised."}, status=status.HTTP_403_FORBIDDEN)

    if not session.recording_key:
        return Response({"detail": "No recording available."}, status=status.HTTP_404_NOT_FOUND)

    from datetime import timedelta as td
    if (timezone.now() - session.scheduled_at).days > 30:
        return Response({"detail": "Recording has expired."}, status=status.HTTP_410_GONE)

    # In production: generate pre-signed R2 URL via boto3
    # For now: return a stub URL
    return Response({"url": f"/stub-recording/{session.recording_key}"})


# ── Student progress for mentor (MM10.1) ──────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_progress(request, student_id):
    """Mentor views a student's analysis score history + shared sessions."""
    mentor = _get_active_mentor(request.user)
    if not mentor:
        return Response({"detail": "No active mentor profile found."}, status=status.HTTP_404_NOT_FOUND)

    from django.contrib.auth.models import User as DjangoUser
    try:
        student = DjangoUser.objects.get(pk=student_id)
    except DjangoUser.DoesNotExist:
        return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    if not MentorSession.objects.filter(mentor=mentor, student=student).exists():
        return Response({"detail": "No shared sessions with this student."}, status=status.HTTP_403_FORBIDDEN)

    # Analysis sessions for this student
    analysis_data = []
    try:
        from analysis.models import AnalysisSession
        analyses = AnalysisSession.objects.filter(
            user=student, status="done", result__isnull=False
        ).order_by("-created_at")[:10]
        for a in analyses:
            r = a.result or {}
            analysis_data.append({
                "created_at": a.created_at,
                "overall_score": r.get("overall_score"),
                "fluency_score": r.get("fluency_score"),
                "grammar_score": r.get("grammar_score"),
                "pace_score": r.get("pace_score"),
                "pronunciation_score": r.get("pronunciation_score"),
                "vocabulary_score": r.get("vocabulary_score"),
            })
    except Exception:
        pass

    # Shared sessions
    sessions = MentorSession.objects.filter(mentor=mentor, student=student).order_by("-scheduled_at")

    # Note
    note_obj = MentorStudentNote.objects.filter(mentor=mentor, student=student).first()
    note = note_obj.note if note_obj else ""

    student_name = f"{student.first_name} {student.last_name}".strip() or student.username
    return Response({
        "student_id": student.id,
        "student_name": student_name,
        "student_initial": student_name[0].upper(),
        "analysis_history": analysis_data,
        "sessions": MentorDashboardSessionSerializer(sessions, many=True).data,
        "note": note,
    })


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def student_note(request, student_id):
    """Mentor saves a note/goal for a specific student. MM10.1"""
    mentor = _get_active_mentor(request.user)
    if not mentor:
        return Response({"detail": "No active mentor profile found."}, status=status.HTTP_404_NOT_FOUND)

    from django.contrib.auth.models import User as DjangoUser
    try:
        student = DjangoUser.objects.get(pk=student_id)
    except DjangoUser.DoesNotExist:
        return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    if not MentorSession.objects.filter(mentor=mentor, student=student).exists():
        return Response({"detail": "No shared sessions with this student."}, status=status.HTTP_403_FORBIDDEN)

    note_text = request.data.get("note", "")
    MentorStudentNote.objects.update_or_create(
        mentor=mentor, student=student,
        defaults={"note": note_text},
    )
    return Response({"saved": True})
