# A1.2 — Auth API Endpoints

## Status: Blocked (requires A1.1)

## Why
Expose user registration and profile management via REST API so future mobile
clients and third-party integrations can authenticate programmatically.

## Endpoints
- `POST /api/v1/auth/register/` — Create a new user
- `POST /api/v1/auth/login/` → delegates to `/api/v1/token/`
- `GET/PUT /api/v1/auth/profile/` — View and update the current user's profile

## Acceptance Criteria
- [ ] User can register via API
- [ ] User can obtain JWT tokens via login
- [ ] User can view and update their profile via API
- [ ] All endpoints return proper validation errors
