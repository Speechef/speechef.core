"""Celery tasks for the mentorship app. MM3.1"""
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
    Sets MentorSession.recording_key on success.
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

    except Exception as exc:
        logger.warning("fetch_and_store_recording failed for session %s: %s", session_id, exc)
        raise self.retry(exc=exc)
