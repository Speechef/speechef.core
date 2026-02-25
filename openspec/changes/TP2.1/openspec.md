# TP2.1 — Test Prep Recent Attempts on Hub

## Status: Unblocked

## Problem
The test prep hub only shows the exam catalogue. Users have no at-a-glance view of their recent attempts or scores.

## Solution
Add a "Recent Attempts" section at the bottom of the test prep hub page. Calls `GET /testprep/attempts/my/`, shows the last 5 completed attempts with exam name, section, score, and date. Empty state if no attempts yet.

## Files
- `frontend/app/(games)/practice/test-prep/page.tsx` (modified)
