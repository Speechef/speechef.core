# WL1.1 — Learn Hub Completion & Bookmark Counters

## Status: Unblocked

## Problem
Users have no at-a-glance sense of their reading progress on the Learn hub. The sidebar shows categories but no summary of how many articles they've completed or bookmarked.

## Solution
Add a "Your Progress" card above the categories in the learn sidebar (only when logged in) showing:
- X / Y posts completed (from is_completed on loaded posts)
- X bookmarked

Since posts are already fetched with is_completed and is_bookmarked, this is a pure frontend calculation over the all-posts query (run a separate query without filters).

## Files
- `frontend/app/(games)/learn/page.tsx` (modified)
