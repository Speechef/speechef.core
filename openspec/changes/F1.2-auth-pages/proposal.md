# F1.2 — Frontend Auth Pages

## Status: Done

## Why
Login, register, and profile pages need to be ported from Django templates to Next.js
and wired to the DRF JWT authentication API.

## Pages
- `/login` — Email + password form → POST to `/api/v1/token/` → store JWT in cookie
- `/register` — Username + email + password → POST to `/api/v1/auth/register/`
- `/profile` — Fetch from `/api/v1/auth/profile/` → editable form → PUT

## Acceptance Criteria
- [ ] User can register via Next.js form
- [ ] User can log in and JWT token stored securely (httpOnly cookie)
- [ ] Protected pages redirect to `/login` if not authenticated
- [ ] User can update username, email, profile picture
- [ ] Logout clears the token and redirects to landing
