# LP1.3 — Landing Page: Inline Analyze Upload Widget

## Status: Done — AnalyzeWidget.tsx with drag-and-drop, file validation, guest/auth flows

## Why
The fastest conversion path is letting users try the product without leaving the landing page. An embedded upload widget drops them directly into the value — before they've even signed up.

## What
An inline drag-and-drop upload zone embedded in the landing page hero area or as its own section just below the hero.

### Widget Behaviour
- Accepts: MP3, WAV, MP4, MOV — max 1GB
- Drag-and-drop + click-to-browse
- In-browser recording button (mic / webcam via `MediaRecorder` API)
- **Guest flow:** after file drop → sign-up modal appears (file queued, continues after auth)
- **Logged-in flow:** file immediately begins upload → redirect to `/analyze?id=<session>`

### UI States
- Idle: dashed border, icon, helper text
- Dragging over: highlighted border, "Drop to analyze"
- Uploading: progress bar with percentage
- Error: red border + friendly error message

## Files to Touch
- `frontend/app/(public)/page.tsx` — add widget section
- `frontend/components/landing/AnalyzeWidget.tsx` (new)
- `frontend/components/landing/RecordModal.tsx` (new)
- `frontend/components/auth/SignUpPromptModal.tsx` (new)

## Done When
- Widget renders on landing page
- File drag-and-drop works
- Guest drop triggers sign-up modal (file is not lost)
- Logged-in user drop starts upload and redirects to `/analyze`
- In-browser mic recording opens modal, captures audio, submits as file
