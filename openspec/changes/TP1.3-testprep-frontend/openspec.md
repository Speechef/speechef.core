# TP1.3 — Test Prep Frontend (/practice/test-prep)

## Status: Blocked → TP1.2

## Why
Test prep is the feature that attracts the most motivated users — those preparing for IELTS, TOEFL, etc. The frontend must feel like a real exam environment: timed, focused, distraction-free.

## What

### Exam Hub `/practice/test-prep`
- Grid of exam cards: IELTS · TOEFL · PTE · OET · CELPIP · DELE · DALF · JLPT
- Each card: exam logo, available sections, "Start Practice" button
- User's past scores per exam shown on each card if available

### Exam Detail `/practice/test-prep/<slug>`
- Exam overview: what it tests, scoring bands, official info
- Section cards: Speaking / Writing / Listening / Reading
- "Full Mock Test" CTA (all sections timed)
- Past attempt history (score + date)

### Practice Session `/practice/test-prep/<slug>/<section>`
**Distraction-free exam UI:**
- Full-screen mode
- Timer countdown (section duration)
- Question progress indicator (Q3 of 12)
- No navigation out without confirming "End Session"

**Question rendering by type:**

`multiple_choice` — 4 option cards, click to select, Next button

`free_speech` —
- Preparation time countdown (e.g., 30s) then recording countdown
- In-browser audio recorder (MediaRecorder API)
- Audio playback before submitting
- Waveform visualization during recording

`listen_and_answer` — audio player (one play allowed per IELTS rules), then answer field

`essay_prompt` — rich text editor with word count, time remaining

**Results Page (after session ends):**
- Predicted band/score (e.g., "Predicted IELTS Speaking: Band 7.0")
- Per-question breakdown: correct / incorrect / AI-scored
- AI feedback on free-speech answers (streamed from I1.9)
- "What to improve" priority list
- CTA: "Practice Again" · "See Full Exam" · "Go to Learn" (links to relevant articles)

## Files to Touch
- `frontend/app/(games)/practice/test-prep/page.tsx` (new)
- `frontend/app/(games)/practice/test-prep/[exam]/page.tsx` (new)
- `frontend/app/(games)/practice/test-prep/[exam]/[section]/page.tsx` (new)
- `frontend/components/testprep/ExamCard.tsx` (new)
- `frontend/components/testprep/QuestionRenderer.tsx` (new)
- `frontend/components/testprep/AudioRecorder.tsx` (new)
- `frontend/components/testprep/ExamTimer.tsx` (new)
- `frontend/components/testprep/ResultsPage.tsx` (new)
- `frontend/lib/api/testprep.ts` (new)

## Done When
- Exam hub shows all exams with real data
- Can start a practice session, answer all question types, and see results
- Audio recorder captures and submits speech correctly
- Predicted score matches expected band range for test answers
- Timer enforces section duration (auto-submits on expire)
- Full-screen mode works on desktop
