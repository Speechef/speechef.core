# Architecture

## System Overview

```
                     ┌─────────────────────────────┐
                     │        USER'S BROWSER        │
                     │    (desktop or mobile)        │
                     └──────────┬──────────────────┘
                                │ HTTPS
                     ┌──────────▼──────────────────┐
                     │         VERCEL CDN           │
                     │      Next.js 16 App          │
                     │                              │
                     │  Landing         (SSG)       │
                     │  Learn articles  (SSR + CSR) │
                     │  Jobs            (SSR)       │
                     │  Games           (CSR)       │
                     │  Dashboard       (CSR)       │
                     │  AI features     (CSR)       │
                     └──────────┬──────────────────┘
                                │ REST API (JSON)
                                │ Authorization: Bearer <jwt>
                     ┌──────────▼──────────────────┐
                     │         RAILWAY              │
                     │    Django 5 + DRF 3          │
                     │                              │
                     │  /admin/                     │
                     │  /api/v1/auth/*              │
                     │  /api/v1/learn/*             │
                     │  /api/v1/practice/*          │
                     │  /api/v1/roleplay/*          │
                     │  /api/v1/interview/*         │
                     │  /api/v1/writing/*           │
                     │  /api/v1/analysis/*          │
                     │  /api/v1/mentors/*           │
                     │  /api/v1/community/*         │
                     │  /api/v1/jobs/*              │
                     └──────┬───────────┬───────────┘
                            │           │
                ┌───────────▼──┐  ┌─────▼────────────┐
                │ PostgreSQL 16 │  │    Redis 7        │
                │              │  │                   │
                │  All models  │  │  Django cache     │
                │              │  │  Celery broker    │
                │              │  │  Session store    │
                └──────────────┘  └─────┬────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │   Celery Worker     │
                              │                     │
                              │  Email delivery     │
                              │  Streak resets      │
                              │  (future: AI jobs)  │
                              └─────────────────────┘
                ┌────────────────────────────────────┐
                │     OpenAI API                      │
                │  GPT-4o  → writing, resume, scoring │
                │  GPT-4o-mini → roleplay turns       │
                └────────────────────────────────────┘
                ┌────────────────────────────────────┐
                │     Cloudflare R2                   │
                │  profile_pics/  (user avatars)      │
                │  media/         (future uploads)    │
                └────────────────────────────────────┘
```

---

## Data Flow — Authentication

```
Browser                    Next.js              Django API           PostgreSQL
  │                          │                     │                    │
  │── POST /login ──────────►│                     │                    │
  │                          │── POST /api/v1/token/►                   │
  │                          │                     │── SELECT users ───►│
  │                          │◄── {access, refresh}─│                   │
  │◄── cookie (access token) │                      │                    │
  │                          │                      │                    │
  │── GET /dashboard ───────►│                      │                    │
  │  (cookie sent auto)      │── GET /auth/profile/ │                    │
  │                          │   Authorization: Bearer <token>           │
  │                          │──────────────────────►│                   │
  │                          │◄── profile JSON ───────│                  │
  │◄── rendered page ────────│                        │                  │
```

Token storage: `access_token` cookie (read by `js-cookie` in `lib/api.ts`).
Token refresh: Axios response interceptor catches 401 → calls `/token/refresh/` → retries.

---

## Data Flow — Playing a Word Game

```
Browser (React)            Django API           PostgreSQL         Redis
  │                           │                    │                 │
  │── GET /practice/question/ │                    │                 │
  │ ─────────────────────────►│                    │                 │
  │                           │── check cache ──────────────────────►│
  │                           │◄── miss ────────────────────────────│
  │                           │── SELECT random VocabWord ─────────►│
  │                           │◄── row ─────────────────────────────│
  │                           │── SET cache 60s ────────────────────►│
  │◄── question JSON ─────────│                    │                 │
  │                           │                    │                 │
  │  [User answers]           │                    │                 │
  │                           │                    │                 │
  │── POST /practice/guess/   │                    │                 │
  │   {answer, word_id} ─────►│                    │                 │
  │                           │── INSERT GameSession ───────────────►│
  │                           │── UPDATE Profile streak ────────────►│
  │◄── {correct, score} ──────│                    │                 │
```

---

## Data Flow — AI Roleplay Turn

```
Browser (React)            Django API           OpenAI API
  │                           │                    │
  │── POST /roleplay/start/   │                    │
  │   {mode: "job_interview"} │                    │
  │──────────────────────────►│                    │
  │                           │── CREATE RoleplaySession              │
  │                           │── GPT-4o-mini system prompt + ──────►│
  │                           │   first question                      │
  │◄── {session_id, question}─│◄── first question ───────────────────│
  │                           │                    │
  │  [User types answer]       │                    │
  │                           │                    │
  │── POST /roleplay/{id}/turn/│                    │
  │   {message: "..."}  ──────►│                   │
  │                           │── append to turns   │
  │                           │── GPT-4o-mini ──────────────────────►│
  │                           │   full conversation history           │
  │◄── {reply, turn_count} ───│◄── AI response ──────────────────────│
  │                           │                    │
  │  [User finishes]           │                    │
  │                           │                    │
  │── POST /roleplay/{id}/finish/                   │
  │──────────────────────────►│                    │
  │                           │── GPT-4o scoring prompt ─────────────►│
  │◄── {score, feedback,      │◄── JSON score report ────────────────│
  │     strengths, tips} ─────│                    │
```

---

## Django Application Structure

```
App            Models                              Key Endpoints
───────────────────────────────────────────────────────────────────────────────
users/         User (Django built-in)              POST /auth/register/
               Profile                             GET/PATCH /auth/profile/
               (current_streak,                    POST /auth/change-password/
                longest_streak, image)             POST /auth/password-reset/
                                                   POST /auth/google/

learn/         Post                                GET /learn/posts/
               Category                            GET /learn/posts/{id}/
               UserBookmark                        GET /learn/categories/
               UserCompletion                      POST /learn/posts/{id}/bookmark/
                                                   POST /learn/posts/{id}/complete/

practice/      VocabWord                           GET /practice/question/
               UserVocabProgress                   POST /practice/guess/
               GameSession                         GET /practice/memory-match/
               SavedWord                           GET /practice/word-scramble/
               DailyChallenge                      GET /practice/daily-challenge/
                                                   GET /practice/sessions/
                                                   GET/POST /practice/saved-words/
                                                   DELETE /practice/saved-words/{id}/
                                                   GET /practice/vocab-words/
                                                   GET /practice/leaderboard/

roleplay/      RoleplaySession                     POST /roleplay/start/
               (mode, turns JSONField,             POST /roleplay/{id}/turn/
                score, status)                     POST /roleplay/{id}/finish/
                                                   GET /roleplay/sessions/

interview/     InterviewSession                    POST /interview/start/
               (mode, difficulty, turns,           POST /interview/{id}/answer/
                overall_score, strengths)          POST /interview/{id}/finish/
                                                   GET /interview/my/

writing/       WritingSession                      POST /writing/analyze/
               ResumeSession                       POST /writing/resume/analyze/
                                                   GET /writing/sessions/
                                                   GET /writing/resume/sessions/

analysis/      AnalysisSession                     POST /analysis/sessions/
               (result: overall_score,             GET /analysis/sessions/
                fluency_score,                     GET /analysis/sessions/{id}/
                vocabulary_score, pace_wpm)

mentorship/    MentorProfile                       GET /mentors/
               MentorBooking                       GET /mentors/{id}/
               MentorFollow                        POST /mentors/{id}/follow/
               MentorApplication                   POST /mentors/{id}/book/
                                                   POST /mentors/apply/
                                                   GET /mentors/apply/status/

community/     Thread                              GET/POST /community/threads/
               Reply                               GET /community/threads/{id}/
               ThreadVote                          POST /community/threads/{id}/replies/
                                                   POST /community/threads/{id}/vote/
                                                   POST /community/replies/{id}/accept/

jobs/          Job                                 GET /jobs/
               Application                         GET /jobs/{id}/
                                                   GET/POST /jobs/applications/
```

---

## Next.js Rendering Strategy

| Page | Strategy | Reason |
|---|---|---|
| Landing | SSG | Maximum performance, SEO for brand search |
| Learn article list | SSR + CSR | SEO for article titles; dynamic filters client-side |
| Learn article detail | SSR | Full content indexed by search engines |
| Jobs listing | SSR | SEO for job titles and companies |
| Dashboard | CSR | Personal data, no SEO value |
| Word games | CSR | Highly interactive, real-time state |
| AI Roleplay / Interview | CSR | Live streaming-style conversation |
| Writing Coach / Resume | CSR | Form submit + async result |
| Mentors list | SSR + CSR | SEO for mentor names; interactions client-side |
| Community threads | SSR + CSR | SEO for question titles |
| Leaderboard | CSR + refetch | Live data, updates after each game |
| Profile | CSR | Private page, personal data |

---

## Database Schema — Key Models

```
auth_user (Django built-in)
  id · username · email · password · is_active · date_joined

users_profile
  id · user_id (FK) · image · current_streak · longest_streak · last_played_date

learn_category
  id · name

learn_post
  id · title · body · created_on · last_modified
  categories (M2M → learn_category)

learn_userbookmark
  id · user_id (FK) · post_id (FK) · created_at

learn_usercompletion
  id · user_id (FK) · post_id (FK) · completed_at

practice_vocabword
  id · word · definition · example · difficulty · category

practice_uservocabprogress
  id · user_id (FK) · word_id (FK) · attempts · correct · last_seen

practice_gamesession
  id · user_id (FK) · game (choice) · score · played_at

practice_savedword
  id · user_id (FK) · word · definition · note · saved_at
  unique_together: [user, word]

practice_dailychallenge
  id · date · word_id (FK) · played_count

roleplay_roleplaysession
  id · user_id (FK) · mode · turns (JSONField) · score · status · started_at · finished_at

interview_interviewsession
  id · user_id (FK) · role · mode · difficulty · turns (JSONField)
      overall_score · summary_feedback · strengths (JSONField) · improvements (JSONField)
      started_at · finished_at

writing_writingsession
  id · user_id (FK) · text_type · input_text · word_count · score · feedback (JSONField) · created_at

writing_resumesession
  id · user_id (FK) · resume_text · target_role · feedback (JSONField) · created_at

analysis_analysissession
  id · user_id (FK) · status · result (JSONField: overall_score, fluency_score,
      vocabulary_score, pace_wpm) · created_at

mentorship_mentorprofile
  id · user_id (FK) · bio · specialties · hourly_rate · is_active
      years_experience · session_count

mentorship_mentorbooking
  id · mentor_id (FK) · learner_id (FK) · scheduled_at · status · notes

mentorship_mentorfollow
  id · user_id (FK) · mentor_id (FK)  [unique_together]

mentorship_mentorapplication
  id · user_id (FK) · bio · specialties · experience · status · reviewer_notes

community_thread
  id · user_id (FK) · title · body · category · is_pinned · view_count · created_at

community_reply
  id · user_id (FK) · thread_id (FK) · body · is_accepted · created_at

community_threadVote
  id · user_id (FK) · thread_id (FK)  [unique_together]

jobs_job
  id · title · description · company · job_type · job_rate · location · url · date

jobs_application
  id · user_id (FK) · job_id (FK) · cover_letter · status · applied_at
```

---

## Settings Split

```
speechef/settings/
  base.py          INSTALLED_APPS, REST_FRAMEWORK, CELERY_*, CORS, static files
  development.py   DEBUG=True, SQLite fallback, console email backend
  production.py    DEBUG=False, R2 storage, Sentry, allowed hosts from env
```

`DJANGO_SETTINGS_MODULE` env variable selects the settings file at startup.

---

## JWT Authentication Flow

Tokens are issued by SimpleJWT and stored as cookies by the Next.js frontend:

```
access_token   short-lived (5 min) · read by js-cookie · sent as Bearer header
refresh_token  long-lived (7 days) · httpOnly cookie (future hardening)
```

Axios interceptor in `frontend/lib/api.ts`:
1. Attaches `Authorization: Bearer <access_token>` to every request
2. On 401 response → calls `/token/refresh/` with the refresh token
3. On success → updates stored token and retries the original request
4. On failure → clears auth state and redirects to `/login`
