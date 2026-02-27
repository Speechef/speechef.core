"""Celery tasks for the mentorship app. MM3.1, MM3.3, MM9.2"""
import logging
import requests
import boto3
from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def fetch_and_store_recording(self, session_id: int, recording_url: str):
    """
    Download a Daily.co session recording and upload it to Cloudflare R2.
    Sets MentorSession.recording_key on success. Chains AI analysis (MM3.3).
    """
    from .models import MentorSession  # local import to avoid circular at import time

    try:
        session = MentorSession.objects.get(pk=session_id)
    except MentorSession.DoesNotExist:
        logger.error("fetch_and_store_recording: session %s not found", session_id)
        return

    try:
        # Download from Daily.co (signed URL, valid ~1 h)
        response = requests.get(recording_url, timeout=300, stream=True)
        response.raise_for_status()

        # Upload to R2
        s3 = boto3.client(
            "s3",
            endpoint_url=getattr(settings, "AWS_S3_ENDPOINT_URL", None),
            aws_access_key_id=getattr(settings, "AWS_ACCESS_KEY_ID", None),
            aws_secret_access_key=getattr(settings, "AWS_SECRET_ACCESS_KEY", None),
        )
        bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", "speechef")
        key = f"recordings/mentor/{session_id}/recording.mp4"

        s3.upload_fileobj(
            response.raw,
            bucket,
            key,
            ExtraArgs={"ContentType": "video/mp4"},
        )

        session.recording_key = key
        if session.status != "completed":
            session.status = "completed"
        session.save(update_fields=["recording_key", "status"])
        logger.info("Recording stored for session %s at %s", session_id, key)

        # MM3.3 — chain AI analysis of the recording
        analyse_mentor_session_recording.delay(session_id)

    except Exception as exc:
        logger.warning("fetch_and_store_recording failed for session %s: %s", session_id, exc)
        raise self.retry(exc=exc)


@shared_task
def analyse_mentor_session_recording(session_id: int):
    """
    Transcribe and score a mentor session recording. Creates an AnalysisSession
    linked to the student user with source='mentor_session'. MM3.3
    """
    from .models import MentorSession
    from analysis.models import AnalysisSession

    try:
        session = MentorSession.objects.select_related("student").get(pk=session_id)
    except MentorSession.DoesNotExist:
        logger.error("analyse_mentor_session_recording: session %s not found", session_id)
        return

    if not session.recording_key:
        logger.info("analyse_mentor_session_recording: session %s has no recording_key, skipping", session_id)
        return

    # Avoid duplicate analysis sessions
    if AnalysisSession.objects.filter(mentor_session=session, source='mentor_session').exists():
        logger.info("analyse_mentor_session_recording: analysis already exists for session %s", session_id)
        return

    analysis = AnalysisSession.objects.create(
        user=session.student,
        file_key=session.recording_key,
        file_type='video',
        source='mentor_session',
        mentor_session=session,
        status='processing',
    )
    logger.info("Created AnalysisSession %s for mentor session %s", analysis.id, session_id)

    # Run the existing analysis pipeline
    try:
        from analysis.tasks import run_analysis
        run_analysis.delay(analysis.id)
    except Exception as exc:
        logger.warning("analyse_mentor_session_recording: could not queue analysis for session %s: %s", session_id, exc)
        analysis.status = 'failed'
        analysis.save(update_fields=['status'])


@shared_task
def evaluate_mentor_badges():
    """
    Nightly task: award top_mentor_rising / top_mentor / top_mentor_elite
    badges to qualifying mentors based on session count and rating. MM9.2
    """
    from .models import MentorProfile
    from users.models import Badge, UserBadge

    BADGE_TIERS = [
        ('top_mentor_elite', 50, 4.9),
        ('top_mentor',       20, 4.7),
        ('top_mentor_rising',  5, 4.5),
    ]

    # Ensure badge objects exist
    badge_defaults = {
        'top_mentor_rising': ('Rising Mentor', 'Awarded to mentors with ≥5 sessions and 4.5+ rating', '⭐'),
        'top_mentor':        ('Top Mentor', 'Awarded to mentors with ≥20 sessions and 4.7+ rating', '🏆'),
        'top_mentor_elite':  ('Elite Mentor', 'Awarded to mentors with ≥50 sessions and 4.9+ rating', '💎'),
    }
    badges = {}
    for badge_type, (name, desc, emoji) in badge_defaults.items():
        badge, _ = Badge.objects.get_or_create(
            badge_type=badge_type,
            defaults={'name': name, 'description': desc, 'emoji': emoji},
        )
        badges[badge_type] = badge

    all_badge_types = set(badge_defaults.keys())

    for mentor in MentorProfile.objects.filter(is_active=True).select_related('user'):
        session_count = mentor.session_count
        rating = float(mentor.rating_avg)

        # Find highest qualifying tier
        qualifying_type = None
        for badge_type, min_sessions, min_rating in BADGE_TIERS:
            if session_count >= min_sessions and rating >= min_rating:
                qualifying_type = badge_type
                break

        # Remove non-qualifying badges
        UserBadge.objects.filter(
            user=mentor.user,
            badge__badge_type__in=all_badge_types,
        ).exclude(
            badge__badge_type=qualifying_type,
        ).delete()

        # Award qualifying badge (idempotent)
        if qualifying_type:
            UserBadge.objects.get_or_create(
                user=mentor.user,
                badge=badges[qualifying_type],
            )

    logger.info("evaluate_mentor_badges: completed")
