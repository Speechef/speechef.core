# MM3.2 — Session Recording Playback

## Status: Blocked → MM3.1

## Why
Once `recording_key` is populated (MM3.1), recordings need to be surfaced in the UI. The My Sessions
past tab already has a placeholder slot for recordings (MM1.3) but renders nothing today.

## What

### Student Side — My Sessions Past Tab
On each past session card where `recording_key` is set:
- Show a `Watch Recording` button
- Clicking fetches a signed URL from `GET /api/v1/mentors/sessions/<id>/recording/`
- Opens a full-screen modal with an HTML5 `<video>` player
- Player controls: play/pause, seek bar, volume, playback speed (0.75×, 1×, 1.25×, 1.5×), fullscreen
- Recording availability note: "Recordings are available for 30 days after your session"

### Mentor Side — Dashboard (MM2.1)
On completed session cards on the mentor dashboard:
- Same `Watch Recording` button + modal

### Recording Expiry
- Backend: `GET /api/v1/mentors/sessions/<id>/recording/` checks if recording is older than 30 days; returns 410 Gone if expired
- Frontend: show "Recording expired" label instead of Watch button for sessions > 30 days old

## Files to Touch
- `frontend/components/mentors/RecordingModal.tsx` (new)
- `frontend/app/(app)/mentors/sessions/page.tsx` — wire Watch button on past session cards
- `frontend/components/mentors/dashboard/UpcomingSessionCard.tsx` — add Watch button for completed sessions
- `backend/mentorship/views.py` — add expiry check to `SessionRecordingView`

## Done When
- Watch Recording button appears on past session cards when recording is available
- Modal plays the recording with all controls working
- Seeking works correctly (video is served from R2 with range request support)
- Expired recordings show correct label, no broken player
- Both student and mentor can access their own session recording; neither can access the other's sessions
