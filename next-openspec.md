# Speechef OpenSpec — Feature Proposal Tracker

> Tracks all feature proposals, bug fixes, and improvements using the OpenSpec workflow.

## Status Summary

| Status    | Count | Proposals                                              |
|-----------|-------|--------------------------------------------------------|
| Unblocked | 7     | B1.1, B1.2, B1.3, G1.1, G1.2, L1.1, A1.1             |
| Blocked   | 7     | G2.1, G2.2, U1.1, U1.2, A1.2, A1.3, L1.2             |
| Archived  | 0     |                                                        |

## Dependency Graph

```
B1.1 ─────────────────────────────────────┐
B1.2 ─────────────────────────────────────┤
B1.3 ─────────────────────────────────────┤  (independent fixes)
                                           │
G1.1 ──┐                                  │
G1.2 ──┼──► G2.1 (Score Tracking) ──► G2.2 (Leaderboard)
L1.1 ──┘                  │
                           └──► U1.1 (Streak) ──► U1.2 (Dashboard)

A1.1 (DRF Foundation) ──► A1.2 (Auth API)
                      ──► A1.3 (Games API) ← requires G1.1, G1.2

L1.1 ─────────────────────────────────────┐
                                           └──► L1.2 (Comment Posting)
```

## All Proposals

### Bug Fixes

| ID   | Title                          | Status    | Blocked By |
|------|--------------------------------|-----------|------------|
| B1.1 | Fix guess_the_word empty crash | Unblocked | —          |
| B1.2 | Fix job_rate null constraint   | Unblocked | —          |
| B1.3 | Configure MEDIA_ROOT           | Unblocked | —          |

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

| ID   | Title                    | Status    | Blocked By      |
|------|--------------------------|-----------|-----------------|
| A1.1 | DRF API Foundation       | Unblocked | —               |
| A1.2 | Auth API Endpoints       | Blocked   | A1.1            |
| A1.3 | Games API Endpoints      | Blocked   | A1.1, G1.1, G1.2|

### Learn

| ID   | Title                    | Status    | Blocked By |
|------|--------------------------|-----------|------------|
| L1.1 | Fix post.completed field | Unblocked | —          |
| L1.2 | Add Comment Posting      | Blocked   | L1.1       |
