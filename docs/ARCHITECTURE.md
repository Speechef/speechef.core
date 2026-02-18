# Architecture

## System Architecture

```
                         ┌─────────────────────────────┐
                         │        USER'S BROWSER        │
                         │    or Mobile Browser         │
                         └──────────┬──────────────────┘
                                    │ HTTPS
                         ┌──────────▼──────────────────┐
                         │         VERCEL CDN           │
                         │      Next.js 15 App          │
                         │                              │
                         │  Landing     (SSG)           │
                         │  Learn       (SSR + CSR)     │
                         │  Jobs        (SSR)           │
                         │  Games       (CSR)           │
                         │  Dashboard   (CSR)           │
                         └──────────┬──────────────────┘
                                    │ REST API (JSON)
                                    │ JWT in Authorization header
                         ┌──────────▼──────────────────┐
                         │         RAILWAY              │
                         │    Django 5 + DRF            │
                         │                              │
                         │  /admin/                     │
                         │  /api/v1/auth/*              │
                         │  /api/v1/learn/*             │
                         │  /api/v1/practice/*          │
                         │  /api/v1/jobs/*              │
                         └──────┬───────────┬───────────┘
                                │           │
                    ┌───────────▼──┐  ┌─────▼────────────┐
                    │ PostgreSQL 16 │  │    Redis 7        │
                    │              │  │                   │
                    │  Users       │  │  Django sessions  │
                    │  Posts       │  │  API rate limit   │
                    │  Games       │  │  Celery broker    │
                    │  Jobs        │  │  Query cache      │
                    └───────────────┘  └─────┬────────────┘
                                             │
                                   ┌─────────▼──────────┐
                                   │   Celery Worker     │
                                   │                     │
                                   │  Email send         │
                                   │  Streak reset       │
                                   │  Future: video      │
                                   │  processing         │
                                   └─────────────────────┘
                    ┌───────────────────────────────────────┐
                    │          Cloudflare R2                 │
                    │                                        │
                    │   profile_pics/    (user avatars)      │
                    │   videos/          (future)            │
                    └───────────────────────────────────────┘
```

---

## Data Flow — Authentication

```
Browser                    Next.js              Django API           PostgreSQL
  │                          │                     │                    │
  │── POST /login ──────────►│                     │                    │
  │                          │── POST /api/v1/token/►                   │
  │                          │                     │── SELECT users ───►│
  │                          │                     │◄── User row ───────│
  │                          │◄── access + refresh ─│                   │
  │                          │  (JWT tokens)        │                    │
  │◄── httpOnly cookie ──────│                      │                    │
  │   (access token)         │                      │                    │
  │                          │                      │                    │
  │── GET /dashboard ───────►│                      │                    │
  │                          │── GET /api/v1/auth/profile/              │
  │                          │   Authorization: Bearer <token>           │
  │                          │──────────────────────►│                   │
  │                          │                       │── SELECT profile ►│
  │                          │◄── profile JSON ───────│                  │
  │◄── HTML (with data) ─────│                        │                  │
```

---

## Data Flow — Playing a Game

```
Browser (React)            Django API           PostgreSQL         Redis
  │                           │                    │                 │
  │── GET /api/v1/practice/   │                    │                 │
  │   question/ ─────────────►│                    │                 │
  │                           │── check cache ─────────────────────►│
  │                           │◄── miss ───────────────────────────│
  │                           │── SELECT random WordQuestion ──────►│
  │                           │◄── question row ────│               │
  │                           │── cache 60s ────────────────────────►│
  │◄── question JSON ─────────│                    │                 │
  │                           │                    │                 │
  │  [User selects answer]     │                    │                 │
  │                           │                    │                 │
  │── POST /api/v1/practice/  │                    │                 │
  │   guess/ ─────────────────►│                   │                 │
  │   { answer, question_id } │                    │                 │
  │                           │── INSERT GameSession ──────────────►│
  │                           │── UPDATE Profile streak ───────────►│
  │◄── { correct, score } ────│                    │                 │
  │                           │                    │                 │
  │  [Show result + score]     │                    │                 │
```

---

## Django Application Structure

```
Backend Django Apps:

home/          Dashboard view (serves authenticated user's home)
│              Queries: GameSession (recent), Profile (streak)

users/         Authentication + profiles
│              Models: Profile (extends Django User)
│              Signals: auto-create Profile on User creation

learn/         Knowledge base
│              Models: Post, Category, Comment
│              Views: list, category filter, detail, comment post

practice/      All games + scoring
│              Models: WordQuestion, MemoryMatch, WordScramble,
│                      GameSession (user × game × score × date)
│              Views: 3 games + leaderboard
│              API:   DRF viewsets for all game endpoints

jobs/          Job listings
│              Models: Jobs (title, company, type, rate, location, url)
│              Views: list only (admin manages content)

speechef/      Project config
│              settings/base.py        (shared)
│              settings/development.py (local)
│              settings/production.py  (Railway)
│              urls.py                 (root router)
│              api_urls.py             (API v1 router)
```

---

## Next.js App Structure

```
frontend/app/

(public)/                    No auth required
  page.tsx                   Landing page (SSG)

(auth)/                      Not logged in only (redirect if authed)
  login/page.tsx
  register/page.tsx

(app)/                       Requires authentication
  layout.tsx                 Navbar + auth guard
  dashboard/page.tsx         Home dashboard (CSR, user data)
  learn/
    page.tsx                 Post list (SSR)
    [slug]/page.tsx          Post detail (SSR)
  practice/
    page.tsx                 Game selection hub
    guess-the-word/page.tsx  React game component (CSR)
    memory-match/page.tsx    React game component (CSR)
    word-scramble/page.tsx   React game component (CSR)
    leaderboard/page.tsx     Leaderboard table (CSR, auto-refresh)
  jobs/
    page.tsx                 Job listings (SSR)
  profile/page.tsx           Profile edit (CSR)
```

---

## API Contract

### Base URL
```
Production:   https://api.speechef.com/api/v1/
Development:  http://localhost:8000/api/v1/
```

### Authentication
```
POST   /token/              Obtain access + refresh tokens
POST   /token/refresh/      Refresh access token
```

### Auth / Users
```
POST   /auth/register/      Create account
GET    /auth/profile/       Get current user profile
PUT    /auth/profile/       Update profile
```

### Learn
```
GET    /learn/posts/                List all posts
GET    /learn/posts/{id}/           Post detail
GET    /learn/categories/           List categories
GET    /learn/posts/?category=X     Filter by category
POST   /learn/posts/{id}/comments/  Add comment (auth required)
```

### Practice
```
GET    /practice/question/          Random WordQuestion
POST   /practice/guess/             Submit Guess the Word answer
GET    /practice/memory-match/      6 random word-meaning pairs
GET    /practice/word-scramble/     Random scrambled word
POST   /practice/word-scramble/     Submit unscramble answer
GET    /practice/leaderboard/       Top 10 by score (all games)
GET    /practice/leaderboard/?game=guess  Filter by game
GET    /practice/sessions/          Current user's game history
```

### Jobs
```
GET    /jobs/                       List all jobs
GET    /jobs/{id}/                  Job detail
```

---

## Database Schema (Key Models)

```
users_user (Django built-in)
  id, username, email, password, is_active, date_joined

users_profile
  id, user_id (FK), image, current_streak, longest_streak, last_played_date

learn_category
  id, name

learn_post
  id, title, body, created_on, last_modified, completed (bool)

learn_post_categories (M2M)
  post_id, category_id

learn_comment
  id, post_id (FK), author, body, created_on

practice_wordquestion
  id, word, correct_meaning, option_a, option_b, option_c, option_d

practice_gamesession
  id, user_id (FK), game (choice), score, played_at

jobs_jobs
  id, title, description, company, job_type, job_rate (nullable),
  location, url, date
```

---

## Rendering Strategy by Page

| Page | Strategy | Why |
|---|---|---|
| Landing | SSG (static) | Never changes, needs fast load + SEO |
| Learn list | SSR | SEO for articles, content updates regularly |
| Learn detail | SSR | Full article content indexed by Google |
| Jobs | SSR | SEO for job titles + companies |
| Dashboard | CSR | Personal data, no SEO needed |
| Games | CSR | Highly interactive, real-time state |
| Leaderboard | CSR + auto-refresh | Live data, updates after each game |
| Profile | CSR | Personal, private page |
