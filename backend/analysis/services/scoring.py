import json
import logging

logger = logging.getLogger(__name__)

SCORING_SYSTEM_PROMPT = """You are an expert communication coach. Analyze the provided speech transcript and return a JSON object with the following fields:
- overall_score (int 0-100)
- fluency (int 0-100): smoothness of speech, absence of unnatural pauses
- vocabulary (int 0-100): richness and appropriateness of word choice
- pace_wpm (int): estimated words per minute
- filler_words (list of {word, count}): e.g. [{"word": "um", "count": 5}]
- grammar_errors (list of {text, suggestion}): up to 5 most important
- tone (str): one of confident, nervous, monotone, energetic, calm
- improvement_priorities (list of 3 strings): the top 3 things to improve
- narrative_feedback (str): 2-3 sentence encouraging coaching summary

Return ONLY valid JSON, no other text."""


def score_transcript(transcript: str, segments: list) -> dict:
    """
    Score a transcript using GPT-4.
    Returns scoring dict with all communication metrics.
    """
    try:
        import openai
        from django.conf import settings

        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

        user_content = f"Transcript:
{transcript}

Total segments: {len(segments)}"

        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SCORING_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.3,
        )

        return json.loads(response.choices[0].message.content)
    except ImportError:
        logger.warning("openai package not installed returning stub scores")
        return {
            "overall_score": 0,
            "fluency": 0,
            "vocabulary": 0,
            "pace_wpm": 0,
            "filler_words": [],
            "grammar_errors": [],
            "tone": "unknown",
            "improvement_priorities": [],
            "narrative_feedback": "",
        }
    except Exception as exc:
        logger.error(f"Scoring failed: {exc}")
        raise
