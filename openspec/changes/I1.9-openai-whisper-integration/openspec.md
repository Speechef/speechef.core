# I1.9 — OpenAI Whisper + GPT-4 Scoring Integration

## Status: Unblocked

## Why
The core AI analysis feature depends on two external AI calls: transcription (Whisper) and scoring (GPT-4). These integrations need to be isolated, testable, and rate-limit safe before any analysis pipeline (I1.8) is built on top of them.

## What
A clean service module wrapping OpenAI API calls for transcription and scoring.

### Transcription (Whisper)
```python
# analysis/services/transcription.py
def transcribe(audio_path: str) -> dict:
    # Returns: {text, segments: [{start, end, text}], language, duration}
```
- Uses `openai.audio.transcriptions.create` with `model="whisper-1"`
- Returns full transcript + word-level timestamps
- Handles errors: file too large, unsupported format, API error

### AI Scoring (GPT-4)
```python
# analysis/services/scoring.py
def score_transcript(transcript: str, segments: list) -> dict:
    # Returns: {
    #   overall_score: int (0-100),
    #   fluency: int, vocabulary: int, pronunciation_note: str,
    #   pace_wpm: int, filler_words: [{word, count, timestamps}],
    #   grammar_errors: [{text, suggestion, position}],
    #   tone: str, improvement_priorities: [str],
    #   narrative_feedback: str
    # }
```
- System prompt instructs GPT-4 to act as a communication coach
- Structured output using JSON mode
- Calculates filler word frequency from transcript segments

### AnalysisResult model
```python
class AnalysisResult(models.Model):
    session = OneToOneField(AnalysisSession)
    transcript = TextField()
    segments = JSONField()              # word-level timestamps
    overall_score = IntegerField()
    fluency_score = IntegerField()
    vocabulary_score = IntegerField()
    pace_wpm = IntegerField()
    filler_words = JSONField()
    grammar_errors = JSONField()
    tone = CharField()
    improvement_priorities = JSONField()
    narrative_feedback = TextField()
```

### Config
- `OPENAI_API_KEY` in `.env`
- Add `openai` to `requirements.txt`
- Retry logic: 3 attempts with exponential backoff on rate limit errors

## Files to Touch
- `backend/analysis/services/transcription.py` (new)
- `backend/analysis/services/scoring.py` (new)
- `backend/analysis/models.py` — add AnalysisResult
- `backend/requirements.txt`
- `.env.example` — add `OPENAI_API_KEY`

## Done When
- `transcribe('/path/to/audio.mp3')` returns a valid transcript dict
- `score_transcript(transcript, segments)` returns a valid scoring dict
- Both functions handle API errors gracefully (raise descriptive exceptions)
- `AnalysisResult` model migrates cleanly in Postgres
- Unit tests with mocked OpenAI responses pass
