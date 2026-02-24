# AI1.3 — Analysis Frontend Page (/analyze)

## Status: Blocked → AI1.2

## Why
The `/analyze` page is the core product interaction. This is where a user goes after uploading, sees their results, and decides what to do next (practice, learn, share).

## What
Build the full `/analyze` page with three states: upload, processing, and results.

### State 1: Upload
- Full-width drag-and-drop zone (same widget as LP1.3 but full-page layout)
- In-browser record button (mic + webcam)
- File type + size validation with friendly errors
- On submit → POST to `/api/v1/analysis/upload/` → transitions to processing state

### State 2: Processing
- Animated waveform while waiting
- Step progress indicator: `Uploading → Transcribing → Scoring → Done`
- Polls `useAnalysisStatus` every 3s
- On `done` → transitions to results state
- On `failed` → shows error message + retry button

### State 3: Results
Tabbed layout:

**Tab 1: Transcript**
- Full scrollable transcript
- Filler words highlighted in amber
- Grammar errors underlined in red with tooltip showing suggestion
- Timestamps on each segment (click to jump in audio player if video)
- Inline audio/video player (if file is available)

**Tab 2: Scores**
- Overall score — large circular gauge
- Skill breakdown radar chart (Fluency, Vocabulary, Pace, Confidence, Grammar, Tone)
- Pace WPM gauge with "too slow / ideal / too fast" zones
- Filler word frequency bar chart (top 5 filler words)

**Tab 3: Improvement Plan**
- Priority list: top 3 areas to fix
- Per-area: explanation + 1 suggested exercise + link to relevant learn article or practice game
- Narrative feedback (full paragraph from GPT-4)

**Tab 4: Compare**
- Side-by-side with previous session (if exists)
- Score delta per skill (green up / red down arrows)
- "You improved X points overall"

### Shareable Scorecard
- `Share →` button generates a branded image (OG card style)
- Shows name, overall score, top skills
- Download as PNG or share link

## Files to Touch
- `frontend/app/(app)/analyze/page.tsx` (new)
- `frontend/app/(app)/analyze/[sessionId]/page.tsx` (new)
- `frontend/components/analyze/UploadZone.tsx` (new)
- `frontend/components/analyze/ProcessingState.tsx` (new)
- `frontend/components/analyze/TranscriptTab.tsx` (new)
- `frontend/components/analyze/ScoresTab.tsx` (new)
- `frontend/components/analyze/ImprovementTab.tsx` (new)
- `frontend/components/analyze/CompareTab.tsx` (new)

## Done When
- Upload → processing → results flow works end-to-end
- All four tabs render correctly with real data
- Filler word highlighting visible in transcript
- Radar chart + gauge render correctly
- Share button generates a downloadable scorecard image
