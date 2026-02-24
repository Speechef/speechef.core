# Speechef OpenSpec — Feature Proposal Tracker

> Tracks all feature proposals, bug fixes, and improvements using the OpenSpec workflow.
> Last updated: 2026-02-24

---

## Status Summary

| Status    | Count | Proposals |
|-----------|-------|-----------|
| Done      | 24    | B1.1, B1.2, B1.3, I1.1, I1.2, I1.3, I1.4, I1.5, I1.6, I1.7, I2.1, G1.1, G1.2, G2.1, G2.2, U1.1, U1.2, A1.1, A1.2, A1.3, L1.1, L1.2, F1.1, F1.2, F1.3, F1.4, F1.5 |
| Unblocked | 5     | LP1.1, AI1.1, ER1.1, J2.1, MM1.1 |
| Blocked   | 16    | LP1.2, LP1.3, LP1.4, LP1.5, LP1.6, AI1.2, AI1.3, AI1.4, ER1.2, ER1.3, ER1.4, TP1.1, TP1.2, TP1.3, J2.2, MM1.2, MM1.3, I1.8, I1.9 |
| Archived  | 0     | — |

---

## Dependency Graph

```
── PHASE 9: Landing Page ───────────────────────────────────────────────────
LP1.1 (landing hero + layout) ──► LP1.2 (dashboard preview widget)
                               ──► LP1.3 (analyze widget on landing)
                               ──► LP1.4 (learn + practice previews)
                               ──► LP1.5 (jobs preview)
                               ──► LP1.6 (mentors preview)

── PHASE 10: AI Analysis ───────────────────────────────────────────────────
I1.8 (media processing pipeline) ──► AI1.1 (AI analysis backend)
I1.9 (Whisper/OpenAI integration) ──► AI1.1
AI1.1 ──► AI1.2 (analysis API endpoints)
AI1.2 ──► AI1.3 (analysis frontend page)
AI1.3 ──► AI1.4 (scorecard widget + shareable card)

── PHASE 11: Expert Review ─────────────────────────────────────────────────
ER1.1 (expert + review models) ──► ER1.2 (review API)
ER1.2 ──► ER1.3 (review submission frontend)
ER1.3 ──► ER1.4 (review status tracker + feedback delivery)

── PHASE 12: Test Prep ─────────────────────────────────────────────────────
TP1.1 (exam + question models) ──► TP1.2 (test prep API)
TP1.2 ──► TP1.3 (test prep frontend: IELTS, TOEFL, PTE, OET...)

── PHASE 13: Jobs Board (Enhanced) ─────────────────────────────────────────
J2.1 (score-match job model) ──► J2.2 (jobs frontend with match indicator)

── PHASE 14: Mentorship Marketplace ────────────────────────────────────────
MM1.1 (mentor profile + booking models) ──► MM1.2 (mentor API + Stripe)
MM1.2 ──► MM1.3 (mentor marketplace frontend)

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

| ID    | Title                                | Status    | Blocked By |
|-------|--------------------------------------|-----------|------------|
| LP1.1 | Landing page: hero + layout scaffold | Unblocked | —          |
| LP1.2 | Landing page: dashboard preview      | Blocked   | LP1.1      |
| LP1.3 | Landing page: analyze upload widget  | Blocked   | LP1.1      |
| LP1.4 | Landing page: learn + practice cards | Blocked   | LP1.1      |
| LP1.5 | Landing page: jobs board preview     | Blocked   | LP1.1      |
| LP1.6 | Landing page: mentors section        | Blocked   | LP1.1      |

---

### Phase 10 — AI Analysis

| ID    | Title                                       | Status    | Blocked By       |
|-------|---------------------------------------------|-----------|------------------|
| I1.8  | Celery media processing pipeline            | Unblocked | —                |
| I1.9  | OpenAI Whisper + scoring integration        | Unblocked | —                |
| AI1.1 | AI analysis backend (transcription + score) | Blocked   | I1.8, I1.9       |
| AI1.2 | Analysis API endpoints                      | Blocked   | AI1.1            |
| AI1.3 | Analysis frontend page (/analyze)           | Blocked   | AI1.2            |
| AI1.4 | Scorecard widget + shareable card           | Blocked   | AI1.3            |

---

### Phase 11 — Expert Panel Review

| ID    | Title                                      | Status    | Blocked By |
|-------|--------------------------------------------|-----------|------------|
| ER1.1 | Expert + Review models + admin             | Unblocked | —          |
| ER1.2 | Expert review API (submit, status, fetch)  | Blocked   | ER1.1      |
| ER1.3 | Review submission frontend (/review)       | Blocked   | ER1.2      |
| ER1.4 | Review status tracker + feedback delivery  | Blocked   | ER1.3      |

---

### Phase 12 — Test Prep

| ID    | Title                                        | Status    | Blocked By |
|-------|----------------------------------------------|-----------|------------|
| TP1.1 | Exam + question models (IELTS, TOEFL, etc.)  | Unblocked | —          |
| TP1.2 | Test prep API endpoints                      | Blocked   | TP1.1      |
| TP1.3 | Test prep frontend pages (/practice/test-prep)| Blocked  | TP1.2      |

---

### Phase 13 — Jobs Board (Enhanced)

| ID    | Title                                       | Status    | Blocked By |
|-------|---------------------------------------------|-----------|------------|
| J2.1  | Score-match job model + employer portal     | Unblocked | —          |
| J2.2  | Jobs frontend with score-match indicator    | Blocked   | J2.1       |

---

### Phase 14 — Mentorship Marketplace

| ID    | Title                                        | Status    | Blocked By  |
|-------|----------------------------------------------|-----------|-------------|
| MM1.1 | Mentor profile + booking + session models    | Unblocked | —           |
| MM1.2 | Mentor API + Stripe payment integration      | Blocked   | MM1.1       |
| MM1.3 | Mentor marketplace frontend (/mentors)       | Blocked   | MM1.2       |
