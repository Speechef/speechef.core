# PR3.1 — Public Profile Copy Link Button

## Summary
Add a "Copy Link" button to the public profile page (`/u/[username]`) so visitors can share anyone's profile.

## Motivation
PR1.2 added a share button to the user's own profile edit page. But when viewing someone else's public profile at `/u/[username]`, there is no quick way to copy and share that URL. Adding a copy-link button completes the sharing loop.

## Changes

### Frontend — `frontend/app/(games)/u/[username]/page.tsx`
- Add `copied` state (boolean) — needs `useState`, so add `'use client'` directive (already present via `use`)
- Add "Copy Link" button below the username in the profile card header
- On click: copies `${window.location.origin}/u/${username}` to clipboard
- Shows "✓ Copied!" for 2 seconds then reverts

## Dependencies
None — purely frontend clipboard API.

## Status
Done
