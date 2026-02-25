# Speechef OpenSpec — Feature Proposal Tracker

> Tracks all feature proposals, bug fixes, and improvements using the OpenSpec workflow.
> Last updated: 2026-02-25 (Phase 26)

---

## Status Summary

| Status    | Count | Proposals |
|-----------|-------|-----------|
| Done      | 101   | B1.1, B1.2, B1.3, I1.1, I1.2, I1.3, I1.4, I1.5, I1.6, I1.7, I1.8, I1.9, I2.1, G1.1, G1.2, G2.1, G2.2, U1.1, U1.2, A1.1, A1.2, A1.3, L1.1, L1.2, F1.1, F1.2, F1.3, F1.4, F1.5, LP1.1, LP1.2, LP1.3, LP1.4, LP1.5, LP1.6, ER1.1, ER1.2, ER1.3, ER1.4, J2.1, J2.2, MM1.1, MM1.2, MM1.3, TP1.1, TP1.2, TP1.3, AI1.1, AI1.2, AI1.3, AI1.4, UG1.1, RP1.1, RP1.2, J2.3, G3.1, G3.2, N1.1, AC1.1, INT1.1, G3.3, L2.1, MY1.1, DB1.1, L2.2, G3.4, G4.1, L3.1, PR1.1, RP1.3, AN1.1, SC1.1, G5.1, ST1.1, J3.1, RP2.1, PR1.2, WL1.1, RP3.1, G7.1, G8.1, L4.1, RP4.1, J5.1, DB2.1, L5.1, M2.1, RP5.1, AN2.1, PR3.1, J6.1, SC2.1, LB2.1, DB3.1, J7.1, RP8.1, G10.1, WL2.1 |
| Unblocked | 0     | — |
| Blocked   | 0     | — |
| Archived  | 0     | — |

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

### ✅ Completed — Bug Fixes

| ID   | Title                          | Status |
|------|--------------------------------|--------|
| B1.1 | Fix guess_the_word empty crash | Done   |
| B1.2 | Fix job_rate null constraint   | Done   |
| B1.3 | Configure MEDIA_ROOT           | Done   |

---

### ✅ Completed — Infrastructure

| ID   | Title                          | Status |
|------|--------------------------------|--------|
| I1.1 | Environment config (.env)      | Done   |
| I1.2 | Switch to PostgreSQL           | Done   |
| I1.3 | Docker + Docker Compose        | Done   |
| I1.4 | Production deployment          | Done   |
| I1.5 | Redis cache backend            | Done   |
| I1.6 | Celery worker                  | Done   |
| I1.7 | Cloudflare R2 media storage    | Done   |
| I2.1 | Monitoring + error tracking    | Done   |
| I1.8 | Celery media processing pipeline            | Done   |
| I1.9 | OpenAI Whisper + GPT-4 scoring integration  | Done   |

---

### ✅ Completed — Games

| ID   | Title                     | Status |
|------|---------------------------|--------|
| G1.1 | Complete Memory Match     | Done   |
| G1.2 | Complete Word Scramble    | Done   |
| G2.1 | User Score Tracking       | Done   |
| G2.2 | Leaderboard               | Done   |

---

### ✅ Completed — User Experience

| ID   | Title                    | Status |
|------|--------------------------|--------|
| U1.1 | Daily Streak Tracking    | Done   |
| U1.2 | User Dashboard / Stats   | Done   |

---

### ✅ Completed — API

| ID   | Title                    | Status |
|------|--------------------------|--------|
| A1.1 | DRF API Foundation       | Done   |
| A1.2 | Auth API Endpoints       | Done   |
| A1.3 | Games API Endpoints      | Done   |

---

### ✅ Completed — Learn

| ID   | Title                    | Status |
|------|--------------------------|--------|
| L1.1 | Fix post.completed field | Done   |
| L1.2 | Add Comment Posting      | Done   |

---

### ✅ Completed — Frontend

| ID   | Title                         | Status |
|------|-------------------------------|--------|
| F1.1 | Next.js project setup         | Done   |
| F1.2 | Auth pages (login, register)  | Done   |
| F1.3 | Learn pages                   | Done   |
| F1.4 | Games pages (interactive)     | Done   |
| F1.5 | Dashboard + Streak UI         | Done   |

---

### Phase 9 — Landing Page

| ID    | Title                                | Status | Blocked By |
|-------|--------------------------------------|--------|------------|
| LP1.1 | Landing page: hero + layout scaffold | Done   | —          |
| LP1.2 | Landing page: dashboard preview      | Done   | LP1.1 ✅   |
| LP1.3 | Landing page: analyze upload widget  | Done   | LP1.1 ✅   |
| LP1.4 | Landing page: learn + practice cards | Done   | LP1.1 ✅   |
| LP1.5 | Landing page: jobs board preview     | Done   | LP1.1 ✅   |
| LP1.6 | Landing page: mentors section        | Done   | LP1.1 ✅   |

---

### Phase 10 — AI Analysis

| ID    | Title                                       | Status    | Blocked By     |
|-------|---------------------------------------------|-----------|----------------|
| AI1.1 | AI analysis backend (transcription + score) | Done      | I1.8 ✅, I1.9 ✅ |
| AI1.2 | Analysis API endpoints                      | Done      | AI1.1 ✅        |
| AI1.3 | Analysis frontend page (/analyze)           | Done      | AI1.2 ✅        |
| AI1.4 | Scorecard widget + shareable card           | Done      | AI1.3 ✅        |

---

### Phase 11 — Expert Panel Review

| ID    | Title                                      | Status    | Blocked By |
|-------|--------------------------------------------|-----------|------------|
| ER1.1 | Expert + Review models + admin             | Done      | —          |
| ER1.2 | Expert review API (submit, status, fetch)  | Done      | ER1.1 ✅   |
| ER1.3 | Review submission frontend (/review)       | Done      | ER1.2 ✅   |
| ER1.4 | Review status tracker + feedback delivery  | Done      | ER1.3 ✅   |

---

### Phase 12 — Test Prep

| ID    | Title                                          | Status | Blocked By |
|-------|------------------------------------------------|--------|------------|
| TP1.1 | Exam + question models (IELTS, TOEFL, etc.)    | Done   | —          |
| TP1.2 | Test prep API endpoints                        | Done   | TP1.1 ✅   |
| TP1.3 | Test prep frontend pages (/practice/test-prep) | Done   | TP1.2 ✅   |

---

### Phase 13 — Jobs Board (Enhanced)

| ID    | Title                                       | Status | Blocked By |
|-------|---------------------------------------------|--------|------------|
| J2.1  | Score-match job model + employer portal     | Done   | —          |
| J2.2  | Jobs frontend with score-match indicator    | Done   | J2.1 ✅    |

---

### Phase 14 — Mentorship Marketplace

| ID    | Title                                        | Status | Blocked By  |
|-------|----------------------------------------------|--------|-------------|
| MM1.1 | Mentor profile + booking + session models    | Done   | —           |
| MM1.2 | Mentor API + Stripe payment integration      | Done   | MM1.1 ✅    |
| MM1.3 | Mentor marketplace frontend (/mentors)       | Done   | MM1.2 ✅    |

---

### Phase 15 — User Growth + Role Play + Employer Portal

| ID    | Title                                               | Status    | Blocked By |
|-------|-----------------------------------------------------|-----------|------------|
| UG1.1 | Enhanced profile page (score history + activity)    | Done ✅   | —          |
| RP1.1 | Role Play backend (models + GPT-4 conversation API) | Done ✅   | —          |
| RP1.2 | Role Play frontend (/practice/roleplay)             | Done ✅   | RP1.1 ✅   |
| J2.3  | Employer job posting portal (/jobs/post)            | Done ✅   | —          |

---

### Phase 16 — Gamification Depth + Notifications + Badges

| ID    | Title                                                | Status    | Blocked By |
|-------|------------------------------------------------------|-----------|------------|
| G3.1  | Vocabulary Blitz game (/practice/vocabulary-blitz)   | Done ✅   | —          |
| G3.2  | Daily Challenge (/practice/daily-challenge)          | Done ✅   | —          |
| N1.1  | Notification center (bell + list + backend model)    | Done ✅   | —          |
| AC1.1 | Achievements & Badges (backend model + profile UI)   | Done ✅   | —          |

---

### Phase 17 — Event Wiring + Sentence Builder + Learn Search

| ID     | Title                                                   | Status    | Blocked By |
|--------|---------------------------------------------------------|-----------|------------|
| INT1.1 | Badge + notification event wiring across all features   | Done ✅   | —          |
| G3.3   | Sentence Builder game (/practice/sentence-builder)      | Done ✅   | —          |
| L2.1   | Learn hub keyword search bar                            | Done ✅   | —          |

---

### Phase 18 — My Applications + Dashboard + Bookmarks + Pronunciation

| ID    | Title                                                     | Status    | Blocked By |
|-------|-----------------------------------------------------------|-----------|------------|
| MY1.1 | My Job Applications page (/jobs/applications)             | Done ✅   | —          |
| DB1.1 | Dashboard game stats + quick links enhancement            | Done ✅   | —          |
| L2.2  | Learn hub bookmarks (save-for-later)                      | Done ✅   | —          |
| G3.4  | Pronunciation Challenge game (/practice/pronunciation-challenge) | Done ✅ | —    |

---

### Phase 19 — Leaderboard + Per-User Completion + Public Profile + Session Detail

| ID    | Title                                                     | Status    | Blocked By |
|-------|-----------------------------------------------------------|-----------|------------|
| G4.1  | Leaderboard game filter tabs (all game types)             | Done ✅   | —          |
| L3.1  | Per-user learn post completion tracking                   | Done ✅   | —          |
| PR1.1 | Public profile page (/u/[username])                       | Done ✅   | —          |
| RP1.3 | Role Play session detail page (/practice/roleplay/session/[id]) | Done ✅ | —   |

---

### Phase 20 — Analysis History + Shareable Scorecard + Game History + Streak Banner

| ID    | Title                                                         | Status    | Blocked By |
|-------|---------------------------------------------------------------|-----------|------------|
| AN1.1 | Analysis session history page (/analyze/history)              | Done ✅   | —          |
| SC1.1 | Shareable analysis scorecard (/share/[id])                    | Done ✅   | —          |
| G5.1  | Game session history page (/practice/history)                 | Done ✅   | —          |
| ST1.1 | Streak risk dashboard banner                                  | Done ✅   | —          |

---

### Phase 21 — Jobs For You + Role Play Stats + Profile Share + Learn Progress

| ID    | Title                                                         | Status    | Blocked By |
|-------|---------------------------------------------------------------|-----------|------------|
| J3.1  | Jobs "For You" qualifying filter tab                          | Done ✅   | —          |
| RP2.1 | Role Play per-mode performance stats on hub                   | Done ✅   | —          |
| PR1.2 | Profile page "Share Profile" copy button                      | Done ✅   | —          |
| WL1.1 | Learn hub completion & bookmark progress counters             | Done ✅   | —          |

---

### Phase 22 — Roleplay History + Activity Calendar + Test Prep Attempts + Related Articles

| ID    | Title                                                         | Status    | Blocked By |
|-------|---------------------------------------------------------------|-----------|------------|
| RP3.1 | Role Play session history page (/practice/roleplay/history)   | Done ✅   | —          |
| G7.1  | Dashboard 7-day activity calendar strip                       | Done ✅   | —          |
| G8.1  | Practice page "Resume Active Session" banner                  | Done ✅   | —          |
| L4.1  | Related articles on learn detail page                         | Done ✅   | —          |

---

### Phase 23 — Roleplay Chips + Jobs Search + Dashboard Best + Learn New Badge

| ID    | Title                                                         | Status    | Blocked By |
|-------|---------------------------------------------------------------|-----------|------------|
| RP4.1 | Role Play topic suggestion chips on setup screen              | Done ✅   | —          |
| J5.1  | Jobs keyword search bar (client-side)                         | Done ✅   | —          |
| DB2.1 | Dashboard "Personal Best" highlight card                      | Done ✅   | —          |
| L5.1  | Learn hub "New" badge for recent posts (< 7 days)             | Done ✅   | —          |
