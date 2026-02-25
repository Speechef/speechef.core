# RP5.1 — Roleplay Session Share Button

## Summary
Add a "Copy Link" button to the roleplay session detail page so users can share their session results.

## Motivation
The analysis scorecard page already has a copy-link feature. Roleplay session detail pages have no sharing mechanism, even though users may want to share their feedback and score with others.

## Changes

### Frontend — `frontend/app/(games)/practice/roleplay/session/[id]/page.tsx`
- Add `copied` state (boolean)
- Add "Copy Link" button in the actions row at the bottom
- On click: copies `${window.location.origin}/practice/roleplay/session/${id}` to clipboard
- Button shows "✓ Copied!" for 2 seconds then reverts

## Dependencies
None — purely frontend clipboard API.

## Status
Done
