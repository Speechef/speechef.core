# Product Roadmap

## Guiding Principle
**Ship working features, not stubs.** Every phase ends with something fully functional
that a real user can use. No placeholder buttons, no "coming soon" on core features.

---

## Phase 0 — Security & Repo Structure
**Goal:** No secrets in code. Repo is clean and organized.
**Duration:** ~3–5 days

### What Gets Done
- [ ] Move `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` to `.env` (Proposal I1.1)
- [ ] Split `settings.py` into `settings/base.py`, `development.py`, `production.py`
- [ ] Add `.env`, `db.sqlite3`, `media/` to `.gitignore`
- [ ] Move Django files into `backend/` directory to prepare for monorepo
- [ ] Create `.env.example` with all required variable names (no values)
- [ ] Commit and push `openspec/`, `docs/`, `next-openspec.md`

### Done When
`python manage.py check --deploy` passes with `DEBUG=False` settings.
No secrets appear anywhere in git history.

---

## Phase 1 — Infrastructure Foundation
**Goal:** `docker compose up` runs the full stack. PostgreSQL replaces SQLite.
**Duration:** ~1 week

### What Gets Done
- [ ] Docker + Docker Compose: `db` (Postgres 16), `redis` (Redis 7), `web` (Django) (I1.3)
- [ ] Switch database to PostgreSQL via `dj-database-url` (I1.2)
- [ ] Install `gunicorn` + `whitenoise` for production-ready serving
- [ ] All existing migrations apply cleanly on PostgreSQL

### Done When
```bash
docker compose up          # starts all services
# visit localhost:8000 → Django running
# admin login works
# all migrations applied
```

---

## Phase 2 — Fix All Bugs
**Goal:** Every existing feature works correctly end-to-end.
**Duration:** ~3–5 days

### What Gets Done
- [ ] **B1.1** Guard `guess_the_word` against empty WordQuestion table
- [ ] **B1.2** Add `null=True` to `jobs.job_rate` + migration
- [ ] **B1.3** Configure `MEDIA_ROOT`, `MEDIA_URL`, profile image upload + resize working
- [ ] **L1.1** Add `Post.completed` boolean field + migration, badge renders correctly

### Done When
- Play Guess the Word on an empty DB → friendly message (no 500 error)
- Create a Job without a rate → saves correctly
- Upload a profile picture → resized, stored, displayed on profile page
- Learn index shows Completed/Pending badges correctly

---

## Phase 3 — REST API Foundation
**Goal:** A fully documented REST API exists. Any HTTP client can register, log in, and fetch data.
**Duration:** ~1 week

### What Gets Done
- [ ] **A1.1** Install DRF + SimpleJWT + CORS. `/api/v1/` root endpoint live
- [ ] JWT token issue + refresh endpoints working
- [ ] **A1.2** `/api/v1/auth/register/`, `/api/v1/auth/profile/` working
- [ ] DRF browsable API enabled in development
- [ ] CORS configured to allow `localhost:3000`

### Done When
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -d '{"username":"test","email":"t@t.com","password":"pass123"}' \
  -H "Content-Type: application/json"

# Get token
curl -X POST http://localhost:8000/api/v1/token/ \
  -d '{"username":"test","password":"pass123"}' \
  -H "Content-Type: application/json"
# → returns access + refresh tokens
```

---

## Phase 4 — Complete All Games
**Goal:** All three games on the Practice page are fully playable.
**Duration:** ~1–2 weeks

### What Gets Done
- [ ] **G1.1** Memory Match: card grid, flip logic, match detection, attempt counter, result page
- [ ] **G1.2** Word Scramble: scramble algorithm, typed input, correct/incorrect feedback
- [ ] **L1.2** Comment posting on Learn post detail pages (auth required)
- [ ] All three game "Play Now" buttons on `/practice` navigate to working games

### Done When
A real user can sit down and play all three games without hitting a dead end or error.
Comments can be posted on Learn articles.

---

## Phase 5 — Gamification
**Goal:** Playing games builds a streak, earns a score, and appears on a leaderboard.
**Duration:** ~1–2 weeks

### What Gets Done
- [ ] **G2.1** `GameSession` model records every completed game (user, game type, score, date)
- [ ] **G2.2** `/practice/leaderboard/` — top 10 users globally and per game
- [ ] **U1.1** Daily streak calculated from GameSession; stored on Profile
- [ ] **U1.2** Home dashboard shows: recent games, stats, real streak circles, recommended game

### Done When
- Play a game → session appears in admin
- Play on 3 consecutive days → streak = 3
- Leaderboard shows real scores from real users
- Dashboard is entirely real data (no hardcoded placeholders)

---

## Phase 6 — Games REST API
**Goal:** All game logic is accessible via JSON API (required by Next.js frontend).
**Duration:** ~1 week

### What Gets Done
- [ ] **A1.3** REST endpoints for all three games:
  - `GET /api/v1/practice/question/`
  - `POST /api/v1/practice/guess/`
  - `GET /api/v1/practice/memory-match/`
  - `GET /api/v1/practice/word-scramble/`
  - `POST /api/v1/practice/word-scramble/`
  - `GET /api/v1/practice/leaderboard/`
  - `GET /api/v1/practice/sessions/`

### Done When
All game endpoints return proper JSON and record sessions for authenticated users.
Games still fully playable via Django templates (no frontend regression).

---

## Phase 7 — Next.js Frontend
**Goal:** The entire user-facing product is served by Next.js. Django templates are internal only (admin).
**Duration:** ~3–4 weeks

### What Gets Done
- [ ] **F1.1** Next.js 15 + Tailwind + shadcn/ui setup, landing page ported
- [ ] **F1.2** Login, register, profile pages — wired to DRF JWT API
- [ ] **F1.3** Learn pages (list, category filter, post detail + comments) — SSR
- [ ] **F1.4** All three games as React components with full interactivity:
  - Memory Match: CSS card flip animation, match state, timer
  - Word Scramble: letter tiles, countdown timer, animated feedback
  - Guess the Word: option cards, instant correct/wrong coloring
- [ ] **F1.5** Dashboard: real streak widget, recent games, stat cards, recommendations
- [ ] Jobs page (SSR)

### Done When
The app at `localhost:3000` is fully functional. Every page works. Games are interactive.
Django at `localhost:8000` only serves `/admin/` and `/api/v1/`.

---

## Phase 8 — Production Deployment
**Goal:** The app is live, secure, monitored, and automatically deployed on every merge to main.
**Duration:** ~1 week

### What Gets Done
- [ ] **I1.4** Railway deploys Django + Postgres + Redis (auto-deploy on push to main)
- [ ] Vercel deploys Next.js (auto-deploy on push to main)
- [ ] Cloudflare R2 for all media files
- [ ] GitHub Actions CI: tests run on every PR, merge blocked on failure
- [ ] **I2.1** Sentry for Python + JS errors, UptimeRobot for uptime alerts
- [ ] Custom domain configured (optional)
- [ ] Production smoke test: register → play game → see streak → leaderboard

### Done When
`https://speechef.com` is live, HTTPS, fast, and errors are tracked automatically.

---

## Future Roadmap (Post-Launch)

### Video Upload & Peer Review
- Users record and upload speech videos
- Community reviews earn review credits
- Reviewers rate: pacing, clarity, filler words, confidence
- AI pre-analysis before human review

### AI Speech Coach
- Real-time speech analysis (filler words, pacing, energy)
- Integration with speech-to-text API (Whisper or Deepgram)
- AI feedback report after each video

### Expert Marketplace
- Speaker profiles: credentials, past talks, reviews
- Booking calendar + payment (Stripe)
- 1:1 coaching sessions via embedded video call

### Exam Preparation
- IELTS, TOEFL, GRE dedicated preparation tracks
- Timed practice tests
- Score simulation and progress tracking

### Mobile App
- React Native app (`speechef.mobile` repo)
- Consumes the same Django REST API
- Daily streak notifications (push notifications)
- Voice recording game mode

### Community
- Discussion forums per learn category
- User profiles with public stats and badges
- Weekly challenges with special leaderboard

---

## Proposal Status Quick Reference

| Proposal | Title | Phase | Status |
|---|---|---|---|
| I1.1 | Env config | 0 | Unblocked |
| I1.2 | PostgreSQL | 1 | Unblocked |
| I1.3 | Docker | 1 | Unblocked |
| B1.1 | Fix empty queryset | 2 | Unblocked |
| B1.2 | Fix job_rate null | 2 | Unblocked |
| B1.3 | MEDIA_ROOT | 2 | Unblocked |
| L1.1 | Fix post.completed | 2 | Unblocked |
| A1.1 | DRF foundation | 3 | Unblocked |
| A1.2 | Auth API | 3 | Blocked → A1.1 |
| G1.1 | Memory Match | 4 | Unblocked |
| G1.2 | Word Scramble | 4 | Unblocked |
| L1.2 | Comment posting | 4 | Blocked → L1.1 |
| G2.1 | Score tracking | 5 | Blocked → G1.1, G1.2 |
| G2.2 | Leaderboard | 5 | Blocked → G2.1 |
| U1.1 | Daily streak | 5 | Blocked → G2.1 |
| U1.2 | Dashboard | 5 | Blocked → U1.1 |
| A1.3 | Games API | 6 | Blocked → A1.1, G1.1, G1.2 |
| F1.1 | Next.js setup | 7 | Unblocked |
| F1.2 | Auth pages | 7 | Blocked → F1.1, A1.2 |
| F1.3 | Learn pages | 7 | Blocked → F1.1 |
| F1.4 | Games pages | 7 | Blocked → F1.1, A1.3 |
| F1.5 | Dashboard | 7 | Blocked → F1.4, U1.2 |
| I1.4 | Deploy | 8 | Blocked → I1.1, I1.2, I1.3 |
| I2.1 | Monitoring | 8 | Blocked → I1.4 |
