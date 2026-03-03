# FP2.1 — Google OAuth & Real Email Activation

## Status: Unblocked

## Why
All the code for Google Sign-In and real SMTP password-reset emails is already
implemented and merged. The features are currently dormant because the required
third-party credentials have not been configured in the environment yet.
Users cannot register/log in with Google, and password-reset emails only print
to the server console instead of reaching the user's inbox.

## What

### 1 — Google OAuth activation
- Create a Google Cloud project and OAuth 2.0 Client ID
  (see `docs/GOOGLE_OAUTH_EMAIL_SETUP.md` for step-by-step instructions)
- Add the production domain to **Authorised JavaScript origins** in Google Console
- Set credentials in environment files

### 2 — SMTP email activation
- Choose an email provider: Gmail App Password (dev/small scale) or
  SendGrid / Mailgun (production)
- Obtain SMTP credentials from the chosen provider
- Set credentials in environment files

### 3 — Environment variables to fill in

**`backend/.env` (or Railway / Render environment):**
```env
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com          # or smtp.sendgrid.net / smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=<sender@email.com>
EMAIL_HOST_PASSWORD=<app-password-or-api-key>
DEFAULT_FROM_EMAIL=Speechef <noreply@speechef.com>

FRONTEND_URL=https://<your-production-domain>
```

**`frontend/.env.local` (or Vercel / Railway environment):**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
```

## Files to Touch
- `.env` — fill in `GOOGLE_CLIENT_ID`, `EMAIL_*`, `FRONTEND_URL`
- `frontend/.env.local` — fill in `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

No code changes required — all backend and frontend logic is already in place:
- `backend/users/api_views.py` — `google_auth` view + updated `forgot_password`
- `backend/users/api_urls.py` — `POST /auth/google/` registered
- `backend/speechef/settings/base.py` — all env vars wired up via `decouple`
- `frontend/lib/auth.ts` — `loginWithGoogle()` function
- `frontend/stores/auth.ts` — `loginWithGoogle` action
- `frontend/app/(auth)/login/page.tsx` — Google button (hidden until env set)
- `frontend/app/(auth)/register/page.tsx` — Google button (hidden until env set)

## Reference
Full setup guide: `docs/GOOGLE_OAUTH_EMAIL_SETUP.md`

## Done When
- [ ] "Sign in with Google" button is visible on `/login` and `/register`
- [ ] Clicking the Google button and selecting an account logs the user in and redirects to `/dashboard`
- [ ] A new Google-only user account is created in the DB on first sign-in
- [ ] An existing account (matched by email) is logged in without creating a duplicate
- [ ] Submitting `/forgot-password` with a valid email sends a real email to the user's inbox within 60 seconds
- [ ] The email contains the branded reset button linking to `/reset-password/[uid]/[token]`
- [ ] Clicking the link and submitting a new password successfully resets it and redirects to `/login`
- [ ] Reset link correctly uses the production `FRONTEND_URL` (not localhost)
