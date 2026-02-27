# RP3.1 — Role Play Session History Page

## Status: Unblocked

## Problem
The role play hub only shows 5 recent sessions. There is no way to browse the full history or filter by mode.

## Solution
Add a `/practice/roleplay/history` page showing all sessions with a mode filter tab bar. Add a "History →" link on the roleplay hub header. Each row links to the session detail page.

## Files
- `frontend/app/(games)/practice/roleplay/history/page.tsx` (new)
- `frontend/app/(games)/practice/roleplay/page.tsx` (modified — add "History →" link)
