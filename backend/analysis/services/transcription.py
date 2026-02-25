import logging

logger = logging.getLogger(__name__)


def transcribe(audio_path: str) -> dict:
    """
    Transcribe audio using OpenAI Whisper API.
    Returns: {text, segments: [{start, end, text}], language, duration}
    """
    try:
        import openai
        from django.conf import settings

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )

        return {
            "text": response.text,
            "segments": [
                {"start": s.start, "end": s.end, "text": s.text}
                for s in (response.segments or [])
            ],
            "language": getattr(response, "language", "en"),
            "duration": getattr(response, "duration", 0),
        }
    except ImportError:
        logger.warning("openai package not installed returning stub transcription")
        return {"text": "", "segments": [], "language": "en", "duration": 0}
    except Exception as exc:
        logger.error(f"Transcription failed: {exc}")
        raise
