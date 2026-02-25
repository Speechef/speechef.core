# PR1.2 — Profile Page Share Button

## Status: Unblocked

## Problem
The public profile page exists at `/u/[username]` but the authenticated user has no easy way to copy and share their profile link from their own profile page.

## Solution
Add a "Share Profile" button (clipboard copy) to the profile page header. On click, copy `<origin>/u/<username>` to clipboard and show "Copied!" confirmation for 2s. Requires reading the username from the existing profile query.

## Files
- `frontend/app/(app)/profile/page.tsx` (modified)
