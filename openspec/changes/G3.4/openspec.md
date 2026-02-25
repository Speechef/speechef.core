# G3.4 — Pronunciation Challenge Game

## Status: Unblocked

## Problem
Speechef focuses on speech coaching but has no pronunciation-specific practice game. Users need a way to practise saying words aloud and get instant feedback.

## Solution
Show a target phrase → user clicks Record → MediaRecorder captures audio → POST to backend → Whisper transcribes → backend compares transcript to target using difflib SequenceMatcher → returns accuracy score (0-100) and highlights mismatched words.

5 rounds. Score out of 500.

## Acceptance Criteria
- `/practice/pronunciation-challenge` page with idle / playing / finished stages
- In-browser MediaRecorder records WAV/WebM audio
- Backend `POST /practice/pronunciation-check/` accepts `audio` (multipart) + `target` (string)
- Backend returns `{ transcript: str, accuracy: int, mismatches: [str] }`
- UI shows matched words in green and missed words in red
- Final results screen with per-round breakdown
- Saves score via `POST /practice/guess/complete/` with `game: "pronunciation"`

## Files
- `backend/practice/api_views.py` (add pronunciation_check)
- `backend/practice/api_urls.py` (add pronunciation-check/ route)
- `frontend/app/(games)/practice/pronunciation-challenge/page.tsx` (new)
- `frontend/app/(games)/practice/page.tsx` (add card)
