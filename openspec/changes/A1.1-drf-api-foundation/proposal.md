# A1.1 — DRF API Foundation

## Status: Unblocked

## Why
The project has no REST API. Adding Django REST Framework (DRF) enables:
- Mobile app support in the future
- Frontend/backend separation
- Third-party integrations (job boards, content feeds)

## What
- Install and configure `djangorestframework`
- Add JWT authentication (`djangorestframework-simplejwt`)
- Set up API root at `/api/v1/`
- Add DRF browsable API in development
- Configure CORS for future frontend use

## Acceptance Criteria
- [ ] `pip install djangorestframework djangorestframework-simplejwt django-cors-headers`
- [ ] `requirements.txt` updated
- [ ] `settings.py` configured with DRF settings and JWT
- [ ] `/api/v1/` returns a root endpoint listing available endpoints
- [ ] `/api/v1/token/` issues JWT tokens
- [ ] `/api/v1/token/refresh/` refreshes tokens
