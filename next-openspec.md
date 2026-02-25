# Speechef OpenSpec — Feature Proposal Tracker

> Tracks all feature proposals, bug fixes, and improvements using the OpenSpec workflow.
> Last updated: 2026-02-26 (Phase 36 — settings tab URL state, public profile privacy, roleplay history URL state, real upload progress, applications detail page)

---

## Status Summary

| Status    | Count | Proposals |
|-----------|-------|-----------|
| Done      | 0     | — |
| Unblocked | 0     | — |
| Blocked   | 0     | — |
| Archived  | 146   | B1.1, B1.2, B1.3, I1.1, I1.2, I1.3, I1.4, I1.5, I1.6, I1.7, I1.8, I1.9, I2.1, G1.1, G1.2, G2.1, G2.2, U1.1, U1.2, A1.1, A1.2, A1.3, L1.1, L1.2, F1.1, F1.2, F1.3, F1.4, F1.5, LP1.1, LP1.2, LP1.3, LP1.4, LP1.5, LP1.6, ER1.1, ER1.2, ER1.3, ER1.4, J2.1, J2.2, MM1.1, MM1.2, MM1.3, TP1.1, TP1.2, TP1.3, AI1.1, AI1.2, AI1.3, AI1.4, UG1.1, RP1.1, RP1.2, J2.3, G3.1, G3.2, N1.1, AC1.1, INT1.1, G3.3, L2.1, MY1.1, DB1.1, L2.2, G3.4, G4.1, L3.1, PR1.1, RP1.3, AN1.1, SC1.1, G5.1, ST1.1, J3.1, RP2.1, PR1.2, WL1.1, RP3.1, G7.1, G8.1, L4.1, RP4.1, J5.1, DB2.1, L5.1, M2.1, RP5.1, AN2.1, PR3.1, J6.1, SC2.1, LB2.1, DB3.1, J7.1, RP8.1, G10.1, WL2.1, N3.1, RS1.1, RP9.1, MS2.1, JB2.1, LB4.1, AN4.1, PR5.1, LN1.1, MD1.1, RP10.1, PF1.1, TP-BE1, TP-BE2, TP-BE3, TP-FE1, TP-FE2, TP-FE3, MN1.1, PH2.1, DB5.1, AN5.1, SET1.1, FT1.1, EP1.1, PW1.1, LN3.1, TP-FE6, AN6.1, DB8.1, FP1.1, LD2.1, LB1.1, JB3.1, PH3.1, MN2.1, JB4.1, RG1.1, LN4.1, RP11.1, ST2.1, DB9.1, SET3.1, PR6.1, RP12.1, AN7.1, JB5.1 |

---

## Dependency Graph

```
── PHASE 9: Landing Page ───────────────────────────────────────────────────
LP1.1 (landing hero + layout) ──► LP1.2 ✅ (dashboard preview widget)
                               ──► LP1.3 ✅ (analyze widget on landing)
                               ──► LP1.4 ✅ (learn + practice previews)
                               ──► LP1.5 ✅ (jobs preview)
                               ──► LP1.6 ✅ (mentors preview)

── PHASE 10: AI Analysis ───────────────────────────────────────────────────
I1.8 (media processing pipeline) ──► AI1.1 (AI analysis backend)
I1.9 (Whisper/OpenAI integration) ──► AI1.1
AI1.1 ──► AI1.2 ✅ (analysis API endpoints)
AI1.2 ──► AI1.3 ✅ (analysis frontend page)
AI1.3 ──► AI1.4 ✅ (scorecard widget + shareable card)

── PHASE 11: Expert Review ─────────────────────────────────────────────────
ER1.1 (expert + review models) ──► ER1.2 ✅ (review API)
ER1.2 ──► ER1.3 ✅ (review submission frontend)
ER1.3 ──► ER1.4 ✅ (review status tracker + feedback delivery)

── PHASE 12: Test Prep ─────────────────────────────────────────────────────
TP1.1 (exam + question models) ──► TP1.2 ✅ (test prep API)
TP1.2 ──► TP1.3 ✅ (test prep frontend: IELTS, TOEFL, PTE, OET...)

── PHASE 13: Jobs Board (Enhanced) ─────────────────────────────────────────
J2.1 (score-match job model) ──► J2.2 ✅ (jobs frontend with match indicator)

── PHASE 14: Mentorship Marketplace ────────────────────────────────────────
MM1.1 (mentor profile + booking models) ──► MM1.2 ✅ (mentor API + Stripe)
MM1.2 ──► MM1.3 ✅ (mentor marketplace frontend)

── PHASE 17: Event Wiring + New Games + Learn Search ────────────────────────
INT1.1 (badge/notif event wiring) → no dependencies
G3.3   (sentence builder game)    → no dependencies
L2.1   (learn hub search)         → no dependencies

── PHASE 16: Gamification Depth + Notifications + Badges ────────────────────
G3.1 (vocabulary blitz game) → no dependencies
G3.2 (daily challenge)       → no dependencies
N1.1 (notification center)   → no dependencies
AC1.1 (achievements + badges) → no dependencies

── PHASE 15: User Growth + Role Play + Employer ─────────────────────────────
UG1.1 (enhanced profile)         → no dependencies
RP1.1 (role play backend)        → no dependencies
RP1.1 ──► RP1.2 ✅ (role play frontend)
J2.3 (employer job posting portal) → no dependencies

── PHASE 21: Jobs For You + Role Play Stats + Profile Share + Learn Progress ──
J3.1  (jobs for you tab)          ✅ → no dependencies
RP2.1 (roleplay mode stats)       ✅ → no dependencies
PR1.2 (profile share button)      ✅ → no dependencies
WL1.1 (learn progress counters)   ✅ → no dependencies

── PHASE 22: Roleplay History + Activity Calendar + Test Prep Attempts + Related Articles ──
RP3.1 (roleplay history page)     ✅ → no dependencies
G7.1  (7-day activity calendar)   ✅ → no dependencies
G8.1  (resume active session CTA) ✅ → no dependencies
L4.1  (related articles)          ✅ → no dependencies

── PHASE 23: Roleplay Chips + Jobs Search + Dashboard Best + Learn New Badge ──
RP4.1 (roleplay topic chips)      ✅ → no dependencies
J5.1  (jobs keyword search)       ✅ → no dependencies
DB2.1 (dashboard personal best)   ✅ → no dependencies
L5.1  (learn new badge)           ✅ → no dependencies

── PHASE 24: Mentor Search + Session Share + Analysis Filter + Profile Share ──
M2.1  (mentor keyword search+sort) ✅ → no dependencies
RP5.1 (roleplay session copy link) ✅ → no dependencies
AN2.1 (analysis history status filter) ✅ → no dependencies
PR3.1 (public profile copy link)   ✅ → no dependencies

── PHASE 25: Job More Jobs + Scorecard Social + Leaderboard Highlight + Dashboard Roleplay ──
J6.1  (job detail more jobs)       ✅ → no dependencies
SC2.1 (scorecard social share)     ✅ → no dependencies
LB2.1 (leaderboard user highlight) ✅ → no dependencies
DB3.1 (dashboard roleplay stats)   ✅ → no dependencies

── PHASE 26: Applications Tabs + Roleplay Resume Banner + History Sort + Learn Prev/Next ──
J7.1  (applications status tabs)   ✅ → no dependencies
RP8.1 (roleplay hub resume banner) ✅ → no dependencies
G10.1 (game history sort)          ✅ → no dependencies
WL2.1 (learn prev/next navigation) ✅ → no dependencies

── PHASE 20: Analysis History + Shareable Scorecard + Game History + Streak Banner ──
AN1.1 (analysis history page)    ✅ → no dependencies
SC1.1 (shareable scorecard)      ✅ → no dependencies
G5.1  (game session history)     ✅ → no dependencies
ST1.1 (streak risk banner)       ✅ → no dependencies

── PHASE 19: Leaderboard + Completion + Public Profile + Session Detail ───────
G4.1  (leaderboard game filters)  ✅ → no dependencies
L3.1  (per-user learn completion) ✅ → no dependencies
PR1.1 (public profile page)       ✅ → no dependencies
RP1.3 (roleplay session detail)   ✅ → no dependencies

── PHASE 18: My Applications + Dashboard + Bookmarks + Pronunciation ─────────
MY1.1 (my job applications page)  ✅ → no dependencies
DB1.1 (dashboard game stats)      ✅ → no dependencies
L2.2  (learn hub bookmarks)       ✅ → no dependencies
G3.4  (pronunciation challenge)   ✅ → no dependencies

── INFRASTRUCTURE ───────────────────────────────────────────────────────────
I1.8 (Celery media pipeline)   → needed by AI1.1
I1.9 (OpenAI Whisper API)      → needed by AI1.1
```

---

## All Proposals

---

### 🗄️ Archived — Bug Fixes

| ID   | Title                          | Status   |
|------|--------------------------------|----------|
| B1.1 | Fix guess_the_word empty crash | Archived |
| B1.2 | Fix job_rate null constraint   | Archived |
| B1.3 | Configure MEDIA_ROOT           | Archived |

---

### 🗄️ Archived — Infrastructure

| ID   | Title                                       | Status   |
|------|---------------------------------------------|----------|
| I1.1 | Environment config (.env)                   | Archived |
| I1.2 | Switch to PostgreSQL                        | Archived |
| I1.3 | Docker + Docker Compose                     | Archived |
| I1.4 | Production deployment                       | Archived |
| I1.5 | Redis cache backend                         | Archived |
| I1.6 | Celery worker                               | Archived |
| I1.7 | Cloudflare R2 media storage                 | Archived |
| I2.1 | Monitoring + error tracking                 | Archived |
| I1.8 | Celery media processing pipeline            | Archived |
| I1.9 | OpenAI Whisper + GPT-4 scoring integration  | Archived |

---

### 🗄️ Archived — Games

| ID   | Title                     | Status   |
|------|---------------------------|----------|
| G1.1 | Complete Memory Match     | Archived |
| G1.2 | Complete Word Scramble    | Archived |
| G2.1 | User Score Tracking       | Archived |
| G2.2 | Leaderboard               | Archived |

---

### 🗄️ Archived — User Experience

| ID   | Title                    | Status   |
|------|--------------------------|----------|
| U1.1 | Daily Streak Tracking    | Archived |
| U1.2 | User Dashboard / Stats   | Archived |

---

### 🗄️ Archived — API

| ID   | Title                    | Status   |
|------|--------------------------|----------|
| A1.1 | DRF API Foundation       | Archived |
| A1.2 | Auth API Endpoints       | Archived |
| A1.3 | Games API Endpoints      | Archived |

---

### 🗄️ Archived — Learn

| ID   | Title                    | Status   |
|------|--------------------------|----------|
| L1.1 | Fix post.completed field | Archived |
| L1.2 | Add Comment Posting      | Archived |

---

### 🗄️ Archived — Frontend

| ID   | Title                         | Status   |
|------|-------------------------------|----------|
| F1.1 | Next.js project setup         | Archived |
| F1.2 | Auth pages (login, register)  | Archived |
| F1.3 | Learn pages                   | Archived |
| F1.4 | Games pages (interactive)     | Archived |
| F1.5 | Dashboard + Streak UI         | Archived |

---

### 🗄️ Archived — Phase 9: Landing Page

| ID    | Title                                | Status   | Blocked By |
|-------|--------------------------------------|----------|------------|
| LP1.1 | Landing page: hero + layout scaffold | Archived | —          |
| LP1.2 | Landing page: dashboard preview      | Archived | LP1.1 ✅   |
| LP1.3 | Landing page: analyze upload widget  | Archived | LP1.1 ✅   |
| LP1.4 | Landing page: learn + practice cards | Archived | LP1.1 ✅   |
| LP1.5 | Landing page: jobs board preview     | Archived | LP1.1 ✅   |
| LP1.6 | Landing page: mentors section        | Archived | LP1.1 ✅   |

---

### 🗄️ Archived — Phase 10: AI Analysis

| ID    | Title                                       | Status   | Blocked By     |
|-------|---------------------------------------------|----------|----------------|
| AI1.1 | AI analysis backend (transcription + score) | Archived | I1.8 ✅, I1.9 ✅ |
| AI1.2 | Analysis API endpoints                      | Archived | AI1.1 ✅        |
| AI1.3 | Analysis frontend page (/analyze)           | Archived | AI1.2 ✅        |
| AI1.4 | Scorecard widget + shareable card           | Archived | AI1.3 ✅        |

---

### 🗄️ Archived — Phase 11: Expert Panel Review

| ID    | Title                                      | Status   | Blocked By |
|-------|--------------------------------------------|----------|------------|
| ER1.1 | Expert + Review models + admin             | Archived | —          |
| ER1.2 | Expert review API (submit, status, fetch)  | Archived | ER1.1 ✅   |
| ER1.3 | Review submission frontend (/review)       | Archived | ER1.2 ✅   |
| ER1.4 | Review status tracker + feedback delivery  | Archived | ER1.3 ✅   |

---

### 🗄️ Archived — Phase 12: Test Prep

| ID    | Title                                          | Status   | Blocked By |
|-------|------------------------------------------------|----------|------------|
| TP1.1 | Exam + question models (IELTS, TOEFL, etc.)    | Archived | —          |
| TP1.2 | Test prep API endpoints                        | Archived | TP1.1 ✅   |
| TP1.3 | Test prep frontend pages (/practice/test-prep) | Archived | TP1.2 ✅   |

---

### 🗄️ Archived — Phase 13: Jobs Board (Enhanced)

| ID   | Title                                    | Status   | Blocked By |
|------|------------------------------------------|----------|------------|
| J2.1 | Score-match job model + employer portal  | Archived | —          |
| J2.2 | Jobs frontend with score-match indicator | Archived | J2.1 ✅    |

---

### 🗄️ Archived — Phase 14: Mentorship Marketplace

| ID    | Title                                        | Status   | Blocked By  |
|-------|----------------------------------------------|----------|-------------|
| MM1.1 | Mentor profile + booking + session models    | Archived | —           |
| MM1.2 | Mentor API + Stripe payment integration      | Archived | MM1.1 ✅    |
| MM1.3 | Mentor marketplace frontend (/mentors)       | Archived | MM1.2 ✅    |

---

### 🗄️ Archived — Phase 15: User Growth + Role Play + Employer Portal

| ID    | Title                                               | Status   | Blocked By |
|-------|-----------------------------------------------------|----------|------------|
| UG1.1 | Enhanced profile page (score history + activity)    | Archived | —          |
| RP1.1 | Role Play backend (models + GPT-4 conversation API) | Archived | —          |
| RP1.2 | Role Play frontend (/practice/roleplay)             | Archived | RP1.1 ✅   |
| J2.3  | Employer job posting portal (/jobs/post)            | Archived | —          |

---

### 🗄️ Archived — Phase 16: Gamification Depth + Notifications + Badges

| ID    | Title                                                | Status   | Blocked By |
|-------|------------------------------------------------------|----------|------------|
| G3.1  | Vocabulary Blitz game (/practice/vocabulary-blitz)   | Archived | —          |
| G3.2  | Daily Challenge (/practice/daily-challenge)          | Archived | —          |
| N1.1  | Notification center (bell + list + backend model)    | Archived | —          |
| AC1.1 | Achievements & Badges (backend model + profile UI)   | Archived | —          |

---

### 🗄️ Archived — Phase 17: Event Wiring + Sentence Builder + Learn Search

| ID     | Title                                                   | Status   | Blocked By |
|--------|---------------------------------------------------------|----------|------------|
| INT1.1 | Badge + notification event wiring across all features   | Archived | —          |
| G3.3   | Sentence Builder game (/practice/sentence-builder)      | Archived | —          |
| L2.1   | Learn hub keyword search bar                            | Archived | —          |

---

### 🗄️ Archived — Phase 18: My Applications + Dashboard + Bookmarks + Pronunciation

| ID    | Title                                                          | Status   | Blocked By |
|-------|----------------------------------------------------------------|----------|------------|
| MY1.1 | My Job Applications page (/jobs/applications)                  | Archived | —          |
| DB1.1 | Dashboard game stats + quick links enhancement                 | Archived | —          |
| L2.2  | Learn hub bookmarks (save-for-later)                           | Archived | —          |
| G3.4  | Pronunciation Challenge game (/practice/pronunciation-challenge)| Archived | —          |

---

### 🗄️ Archived — Phase 19: Leaderboard + Per-User Completion + Public Profile + Session Detail

| ID    | Title                                                     | Status   | Blocked By |
|-------|-----------------------------------------------------------|----------|------------|
| G4.1  | Leaderboard game filter tabs (all game types)             | Archived | —          |
| L3.1  | Per-user learn post completion tracking                   | Archived | —          |
| PR1.1 | Public profile page (/u/[username])                       | Archived | —          |
| RP1.3 | Role Play session detail page (/practice/roleplay/session/[id]) | Archived | —   |

---

### 🗄️ Archived — Phase 20: Analysis History + Shareable Scorecard + Game History + Streak Banner

| ID    | Title                                                         | Status   | Blocked By |
|-------|---------------------------------------------------------------|----------|------------|
| AN1.1 | Analysis session history page (/analyze/history)              | Archived | —          |
| SC1.1 | Shareable analysis scorecard (/share/[id])                    | Archived | —          |
| G5.1  | Game session history page (/practice/history)                 | Archived | —          |
| ST1.1 | Streak risk dashboard banner                                  | Archived | —          |

---

### 🗄️ Archived — Phase 21: Jobs For You + Role Play Stats + Profile Share + Learn Progress

| ID    | Title                                                         | Status   | Blocked By |
|-------|---------------------------------------------------------------|----------|------------|
| J3.1  | Jobs "For You" qualifying filter tab                          | Archived | —          |
| RP2.1 | Role Play per-mode performance stats on hub                   | Archived | —          |
| PR1.2 | Profile page "Share Profile" copy button                      | Archived | —          |
| WL1.1 | Learn hub completion & bookmark progress counters             | Archived | —          |

---

### 🗄️ Archived — Phase 22: Roleplay History + Activity Calendar + Test Prep Attempts + Related Articles

| ID    | Title                                                         | Status   | Blocked By |
|-------|---------------------------------------------------------------|----------|------------|
| RP3.1 | Role Play session history page (/practice/roleplay/history)   | Archived | —          |
| G7.1  | Dashboard 7-day activity calendar strip                       | Archived | —          |
| G8.1  | Practice page "Resume Active Session" banner                  | Archived | —          |
| L4.1  | Related articles on learn detail page                         | Archived | —          |

---

### 🗄️ Archived — Phase 23: Roleplay Chips + Jobs Search + Dashboard Best + Learn New Badge

| ID    | Title                                                         | Status   | Blocked By |
|-------|---------------------------------------------------------------|----------|------------|
| RP4.1 | Role Play topic suggestion chips on setup screen              | Archived | —          |
| J5.1  | Jobs keyword search bar (client-side)                         | Archived | —          |
| DB2.1 | Dashboard "Personal Best" highlight card                      | Archived | —          |
| L5.1  | Learn hub "New" badge for recent posts (< 7 days)             | Archived | —          |

---

### 🗄️ Archived — Phase 24: Mentor Search + Session Share + Analysis Filter + Profile Share

| ID    | Title                                          | Status   | Blocked By |
|-------|------------------------------------------------|----------|------------|
| M2.1  | Mentor keyword search + sort                   | Archived | —          |
| RP5.1 | Roleplay session copy link                     | Archived | —          |
| AN2.1 | Analysis history status filter                 | Archived | —          |
| PR3.1 | Public profile copy link                       | Archived | —          |

---

### 🗄️ Archived — Phase 25: Job More Jobs + Scorecard Social + Leaderboard Highlight + Dashboard Roleplay

| ID    | Title                                          | Status   | Blocked By |
|-------|------------------------------------------------|----------|------------|
| J6.1  | Job detail "More Jobs" sidebar                 | Archived | —          |
| SC2.1 | Scorecard social share buttons                 | Archived | —          |
| LB2.1 | Leaderboard current-user row highlight         | Archived | —          |
| DB3.1 | Dashboard roleplay stats card                  | Archived | —          |

---

### 🗄️ Archived — Phase 26: Applications Tabs + Roleplay Resume Banner + History Sort + Learn Prev/Next

| ID    | Title                                          | Status   | Blocked By |
|-------|------------------------------------------------|----------|------------|
| J7.1  | My Applications status filter tabs             | Archived | —          |
| RP8.1 | Roleplay hub resume active session banner      | Archived | —          |
| G10.1 | Game history sort (newest/oldest/score)        | Archived | —          |
| WL2.1 | Learn detail prev/next article navigation      | Archived | —          |

---

### 🗄️ Archived — Phase 27+: Polish + UX Improvements

| ID     | Title                                                              | Status   | Blocked By |
|--------|--------------------------------------------------------------------|----------|------------|
| N3.1   | Notification unread count badge on bell icon                       | Archived | —          |
| RS1.1  | Role Play real-time score preview                                   | Archived | —          |
| RP9.1  | Roleplay session export (copy transcript)                          | Archived | —          |
| MS2.1  | Mentor session booking confirmation email                          | Archived | —          |
| JB2.1  | Job board "Easy Apply" badge                                       | Archived | —          |
| LB4.1  | Leaderboard top-3 podium display                                   | Archived | —          |
| AN4.1  | Analysis page file size/duration info                              | Archived | —          |
| PR5.1  | Profile page edit avatar                                           | Archived | —          |
| LN1.1  | Landing page responsive polish                                     | Archived | —          |
| MD1.1  | Mentor detail page improvements                                    | Archived | —          |
| RP10.1 | Roleplay score breakdown modal                                      | Archived | —          |
| PF1.1  | Profile page follow/connect button                                 | Archived | —          |

---

### 🗄️ Archived — Test Prep Backend & Frontend Expansions

| ID      | Title                                             | Status   | Blocked By |
|---------|---------------------------------------------------|----------|------------|
| TP-BE1  | Test prep attempt model + scoring backend         | Archived | —          |
| TP-BE2  | Test prep attempt API endpoints                   | Archived | —          |
| TP-BE3  | Test prep exam seed data                          | Archived | —          |
| TP-FE1  | Test prep exam hub page                           | Archived | —          |
| TP-FE2  | Test prep question attempt UI                     | Archived | —          |
| TP-FE3  | Test prep results + score breakdown               | Archived | —          |
| TP-FE6  | API-driven test prep chips on practice page       | Archived | —          |

---

### 🗄️ Archived — Phase 30–33: Mobile, Polish & UX

| ID     | Title                                                              | Status   | Blocked By |
|--------|--------------------------------------------------------------------|----------|------------|
| MN1.1  | Navbar mobile hamburger menu                                       | Archived | —          |
| PH2.1  | Practice hub word game stats (played count + best score)          | Archived | —          |
| DB5.1  | Dashboard score trend sparkline                                    | Archived | —          |
| AN5.1  | Analyze page score delta badge (vs last session)                   | Archived | —          |
| SET1.1 | Settings page (account, notifications, privacy, danger zone)       | Archived | —          |
| FT1.1  | Shared footer component across all layouts                         | Archived | —          |
| EP1.1  | Custom 404 and error pages                                         | Archived | —          |
| PW1.1  | Backend password change endpoint                                   | Archived | —          |
| LN3.1  | Public navbar mobile hamburger                                     | Archived | —          |
| AN6.1  | Analysis history score trend chart                                 | Archived | —          |
| DB8.1  | Dashboard new-user onboarding card                                 | Archived | —          |
| FP1.1  | Forgot password flow (backend + login link + reset pages)          | Archived | —          |
| LD2.1  | Learn hub mobile-responsive sidebar                                | Archived | —          |
| LB1.1  | Leaderboard game filter URL state persistence                      | Archived | —          |
| JB3.1  | Job cover note character counter (500 char max)                    | Archived | —          |
| PH3.1  | Practice history game filter URL state persistence                 | Archived | —          |
| MN2.1  | Mentors page filter URL state (specialty, language, sort, search)  | Archived | —          |
| JB4.1  | Jobs page filter URL state (search, forYou, remote, type, sort)    | Archived | —          |
| RG1.1  | Register page show/hide password toggle + strength indicator       | Archived | —          |
| LN4.1  | Learn article reading time estimate in header                      | Archived | —          |
| RP11.1 | Roleplay hub mode filter on recent sessions list                   | Archived | —          |
| ST2.1  | Settings notification+privacy prefs backend sync (model+API+FE)    | Archived | —          |
| DB9.1  | Dashboard weekly goals card with progress bar                      | Archived | —          |
| SET3.1 | Settings page tab URL state (?tab=notifications)                   | Archived | —          |
| PR6.1  | Public profile backend privacy check (show_score, show_streak)     | Archived | —          |
| RP12.1 | Roleplay history URL state (mode, sort persist in URL)             | Archived | —          |
| AN7.1  | Real upload progress via axios onUploadProgress callback           | Archived | —          |
| JB5.1  | Job applications detail page + list cards as Links                 | Archived | —          |
