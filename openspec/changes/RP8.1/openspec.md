# RP8.1 — Roleplay Hub Active Session Resume Banner

## Summary
When the user has an active (unfinished) roleplay session, show a resume banner at the top of the roleplay hub page.

## Changes

### Frontend — `frontend/app/(games)/practice/roleplay/page.tsx`
- Filter `sessions` for `status === 'active'`; if found, render a navy banner above the mode cards
- Banner shows mode + topic and a "Resume →" link to `/practice/roleplay/<mode>`
- Sessions are already fetched by the existing query — no new API call needed

## Status
Done
