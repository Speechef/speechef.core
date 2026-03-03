# Google OAuth & Email Setup

This document covers how to configure Google Sign-In and real email delivery for Speechef.

---

## 1. Google OAuth (Sign in with Google)

### 1.1 Create a Google Cloud project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project selector at the top → **New Project**
3. Give it a name (e.g. `speechef-prod`) and click **Create**

### 1.2 Enable the required API

1. In the left sidebar go to **APIs & Services → Library**
2. Search for **Google Identity** (or "OAuth") — it is enabled by default for most projects, but confirm it shows as enabled

### 1.3 Create OAuth credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth 2.0 Client ID**
3. If prompted, configure the **OAuth consent screen** first:
   - User type: **External**
   - App name: `Speechef`
   - Support email: your email
   - Authorised domain: `speechef.com` (add your production domain)
   - Save and continue through the remaining steps
4. Back in Credentials → Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: `Speechef Web`
   - **Authorised JavaScript origins** — add all origins that will load the sign-in button:
     ```
     http://localhost:3000
     https://yourdomain.com
     ```
   - **Authorised redirect URIs** — not required for the ID token flow used here, but add if needed:
     ```
     https://yourdomain.com/dashboard
     ```
5. Click **Create** — copy the **Client ID** (looks like `123456789-xxxx.apps.googleusercontent.com`)

### 1.4 Add environment variables

**Backend `.env`:**
```env
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

> Both must use the **same** Client ID value.

### 1.5 How it works (flow summary)

```
User clicks "Sign in with Google"
    ↓
Google Identity Services (GSI) script shows account picker
    ↓
User selects account → GSI returns a signed ID token (JWT)
    ↓
Frontend: POST /api/v1/auth/google/ { credential: "<id_token>" }
    ↓
Backend: verifies token with https://oauth2.googleapis.com/tokeninfo
    ↓
Backend: finds existing user by email OR creates new account
    ↓
Backend: returns Speechef JWT { access, refresh }
    ↓
Frontend: stores tokens in cookies → redirects to /dashboard
```

### 1.6 Google-only accounts

Users who register via Google have no password. They can set one later using **Forgot Password** — the reset email will be sent to their Google email address.

---

## 2. Real Email Delivery (Password Reset)

The `forgot_password` endpoint sends a branded HTML email with a reset link. In development the email prints to the console. In production you need an SMTP provider.

### Option A — Gmail (simple, good for small scale)

1. Enable **2-Step Verification** on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Select app: **Mail**, device: **Other** → type `Speechef`
4. Copy the generated 16-character app password

**Backend `.env`:**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=you@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop    # 16-char app password (spaces are fine)
DEFAULT_FROM_EMAIL=Speechef <you@gmail.com>
```

> Gmail has a daily sending limit of ~500 emails/day. Use a transactional provider for higher volume.

### Option B — SendGrid (recommended for production)

1. Create a free account at [https://sendgrid.com](https://sendgrid.com)
2. Go to **Settings → API Keys → Create API Key** (Full Access)
3. Verify your sender domain under **Sender Authentication**

**Backend `.env`:**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxx    # your SendGrid API key
DEFAULT_FROM_EMAIL=Speechef <noreply@yourdomain.com>
```

### Option C — Mailgun

1. Sign up at [https://mailgun.com](https://mailgun.com)
2. Add and verify your sending domain
3. Get SMTP credentials from **Sending → Domain settings → SMTP credentials**

**Backend `.env`:**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@mg.yourdomain.com
EMAIL_HOST_PASSWORD=your_mailgun_smtp_password
DEFAULT_FROM_EMAIL=Speechef <noreply@yourdomain.com>
```

### 2.1 Development (console backend)

Leave `EMAIL_BACKEND` unset (or set it to the console backend) to print emails to the Django log instead of sending them. The reset URL will appear in the server output:

```
[PASSWORD RESET FALLBACK] http://localhost:3000/reset-password/<uid>/<token>
```

---

## 3. Frontend URL

Make sure the backend knows where the frontend lives so reset links point to the right domain:

**Backend `.env`:**
```env
FRONTEND_URL=https://yourdomain.com   # no trailing slash
```

For local development the default is already `http://localhost:3000`.

---

## 4. Quick checklist

| # | Task | Done |
|---|------|------|
| 1 | Created Google Cloud project | ☐ |
| 2 | Created OAuth 2.0 Client ID | ☐ |
| 3 | Added JS origins (localhost + prod domain) | ☐ |
| 4 | Set `GOOGLE_CLIENT_ID` in backend `.env` | ☐ |
| 5 | Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend `.env.local` | ☐ |
| 6 | Chose email provider (Gmail / SendGrid / Mailgun) | ☐ |
| 7 | Set `EMAIL_*` variables in backend `.env` | ☐ |
| 8 | Set `FRONTEND_URL` in backend `.env` | ☐ |
| 9 | Tested password reset email end-to-end | ☐ |
| 10 | Tested Google sign-in on login + register pages | ☐ |
