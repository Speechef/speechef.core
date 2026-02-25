import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_media_upload(self, session_id):
    """Entry point: download file, extract audio if video, trigger transcription."""
    from .models import AnalysisSession
    from django.utils import timezone

    try:
        session = AnalysisSession.objects.get(id=session_id)
        session.status = 'processing'
        session.save(update_fields=['status'])

        # TODO: download from R2, extract audio with FFmpeg, then call transcription
        # run_transcription.delay(session_id)

        logger.info(f'process_media_upload queued for session {session_id}')
    except AnalysisSession.DoesNotExist:
        logger.error(f'AnalysisSession {session_id} not found')
    except Exception as exc:
        try:
            session.status = 'failed'
            session.error = str(exc)
            session.save(update_fields=['status', 'error'])
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def run_transcription(self, session_id, audio_path):
    """Call Whisper API to transcribe audio."""
    from .services.transcription import transcribe
    logger.info(f'run_transcription for session {session_id}')
    try:
        result = transcribe(audio_path)
        run_ai_scoring.delay(session_id, result['text'], result.get('segments', []))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def run_ai_scoring(self, session_id, transcript, segments):
    """Call GPT-4 to score the transcript and store results."""
    from .services.scoring import score_transcript
    from .models import AnalysisSession, AnalysisResult
    from django.utils import timezone

    try:
        session = AnalysisSession.objects.get(id=session_id)
        scores = score_transcript(transcript, segments)

        AnalysisResult.objects.update_or_create(
            session=session,
            defaults={
                'transcript': transcript,
                'segments': segments,
                'overall_score': scores.get('overall_score', 0),
                'fluency_score': scores.get('fluency', 0),
                'vocabulary_score': scores.get('vocabulary', 0),
                'pace_wpm': scores.get('pace_wpm', 0),
                'filler_words': scores.get('filler_words', []),
                'grammar_errors': scores.get('grammar_errors', []),
                'tone': scores.get('tone', ''),
                'improvement_priorities': scores.get('improvement_priorities', []),
                'narrative_feedback': scores.get('narrative_feedback', ''),
            }
        )
        session.status = 'done'
        session.completed_at = timezone.now()
        session.save(update_fields=['status', 'completed_at'])

        # ── Award badges + send notification ──────────────────────────────
        try:
            from users.badges import award_badge
            from users.models import Notification

            user = session.user
            overall = scores.get('overall_score', 0)

            award_badge(user, 'first_analysis')

            if overall >= 100:
                award_badge(user, 'score_100')
            elif overall >= 90:
                award_badge(user, 'score_90')
            elif overall >= 80:
                award_badge(user, 'score_80')

            Notification.objects.create(
                user=user,
                title='Your analysis is ready!',
                body=f'You scored {overall}/100. Check your results and improvement plan.',
                notification_type='score_improvement',
                link='/analyze',
            )
        except Exception as badge_exc:
            logger.warning(f'Badge/notification error after scoring: {badge_exc}')

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
