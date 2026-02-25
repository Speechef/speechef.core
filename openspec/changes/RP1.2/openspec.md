# RP1.2 — Role Play Frontend

## Status: Blocked By RP1.1

## Summary
Build the Role Play section of the practice hub. Includes a mode selection hub and a live conversation interface.

## Pages
1. **`/practice/roleplay/page.tsx`** — Mode selector hub
   - 4 mode cards: Job Interview, Presentation Pitch, Debate, Small Talk
   - Each card shows description + "Start Session →" button
   - Recent sessions list below

2. **`/practice/roleplay/[mode]/page.tsx`** — Live session
   - Topic input at start (e.g. "Software Engineer at Google")
   - Chat-style interface: AI messages left, user messages right
   - Text input + send button (future: mic recording)
   - "Finish Session" button → triggers scoring → shows results card
   - Results: score, AI feedback, "Try Again" / "Share" buttons

## Practice Page Update
- Update `/practice/page.tsx` to add Role Play section alongside word games

## Files
- `frontend/app/(games)/practice/roleplay/page.tsx`
- `frontend/app/(games)/practice/roleplay/[mode]/page.tsx`
- `frontend/app/(games)/practice/page.tsx` — add Role Play + Test Prep sections
