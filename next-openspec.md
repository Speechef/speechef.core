# Speechef OpenSpec — Feature Proposal Tracker

> Tracks all feature proposals, bug fixes, and improvements using the OpenSpec workflow.

## Status Summary

| Status    | Count | Proposals                                                                 |
|-----------|-------|---------------------------------------------------------------------------|
| Unblocked | 11    | B1.1, B1.2, B1.3, I1.1, I1.2, I1.3, G1.1, G1.2, L1.1, A1.1, F1.1      |
| Blocked   | 13    | G2.1, G2.2, U1.1, U1.2, A1.2, A1.3, L1.2, I1.4, F1.2, F1.3, F1.4, F1.5, I2.1 |
| Archived  | 0     |                                                                           |

## Dependency Graph

```
B1.1 ──────────────────────────────────────────────────────┐
B1.2 ──────────────────────────────────────────────────────┤ (independent fixes)
B1.3 ──────────────────────────────────────────────────────┤
                                                            │
I1.1 (env config) ──► I1.2 (postgres) ──► I1.3 (docker)  ├──► I1.4 (deploy)
                                                            │
G1.1 ──┐                                                   │
G1.2 ──┼──► G2.1 (scoring) ──► G2.2 (leaderboard)        │
L1.1 ──┘         │                                         │
                  └──► U1.1 (streak) ──► U1.2 (dashboard) │
                                                            │
A1.1 (DRF) ──► A1.2 (auth API)                            │
           ──► A1.3 (games API) ◄── G1.1, G1.2            │
                                                            │
F1.1 (Next.js setup) ──► F1.2 (auth pages)               │
                     ──► F1.3 (learn pages)                │
                     ──► F1.4 (games pages) ◄── A1.3      │
                     ──► F1.5 (dashboard) ◄── U1.2         │
                                                            │
I2.1 (monitoring) ◄── I1.4                                 │
```

## All Proposals

### Bug Fixes

| ID   | Title                          | Status    | Blocked By |
|------|--------------------------------|-----------|------------|
| B1.1 | Fix guess_the_word empty crash | Unblocked | —          |
| B1.2 | Fix job_rate null constraint   | Unblocked | —          |
| B1.3 | Configure MEDIA_ROOT           | Unblocked | —          |

### Infrastructure

| ID   | Title                         | Status    | Blocked By  |
|------|-------------------------------|-----------|-------------|
| I1.1 | Environment config (.env)     | Unblocked | —           |
| I1.2 | Switch to PostgreSQL          | Unblocked | —           |
| I1.3 | Docker + Docker Compose       | Unblocked | —           |
| I1.4 | Production deployment         | Blocked   | I1.1, I1.2, I1.3 |
| I2.1 | Monitoring + error tracking   | Blocked   | I1.4        |

### Games

| ID   | Title                     | Status    | Blocked By      |
|------|---------------------------|-----------|-----------------|
| G1.1 | Complete Memory Match     | Unblocked | —               |
| G1.2 | Complete Word Scramble    | Unblocked | —               |
| G2.1 | User Score Tracking       | Blocked   | G1.1, G1.2      |
| G2.2 | Leaderboard               | Blocked   | G2.1            |

### User Experience

| ID   | Title                    | Status  | Blocked By |
|------|--------------------------|---------|------------|
| U1.1 | Daily Streak Tracking    | Blocked | G2.1       |
| U1.2 | User Dashboard / Stats   | Blocked | U1.1       |

### API

| ID   | Title                    | Status    | Blocked By       |
|------|--------------------------|-----------|------------------|
| A1.1 | DRF API Foundation       | Unblocked | —                |
| A1.2 | Auth API Endpoints       | Blocked   | A1.1             |
| A1.3 | Games API Endpoints      | Blocked   | A1.1, G1.1, G1.2 |

### Learn

| ID   | Title                    | Status    | Blocked By |
|------|--------------------------|-----------|------------|
| L1.1 | Fix post.completed field | Unblocked | —          |
| L1.2 | Add Comment Posting      | Blocked   | L1.1       |

### Frontend (Next.js)

| ID   | Title                         | Status    | Blocked By      |
|------|-------------------------------|-----------|-----------------|
| F1.1 | Next.js project setup         | Unblocked | —               |
| F1.2 | Auth pages (login, register)  | Blocked   | F1.1, A1.2      |
| F1.3 | Learn pages                   | Blocked   | F1.1, A1.1      |
| F1.4 | Games pages (interactive)     | Blocked   | F1.1, A1.3      |
| F1.5 | Dashboard + Streak UI         | Blocked   | F1.4, U1.2      |
