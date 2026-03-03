# Product Roadmap

> **Principle: Ship working features, not stubs.**
> Every release ends with something a real user can use end-to-end. No placeholder buttons.

---

## V1 — Shipped ✅

All core features are live. The full platform is functional.

| Feature | Status |
|---|---|
| Auth (JWT + Google OAuth + password reset) | ✅ Done |
| Recipe Book (Learn) — articles, categories, bookmarks, completions | ✅ Done |
| Word Games (6 games) — Blitz, Guess, Match, Scramble, Sentence Builder, Pronunciation | ✅ Done |
| Daily Challenge | ✅ Done |
| AI Roleplay (4 modes) — GPT-4o-mini real-time conversation | ✅ Done |
| Interview Simulation — text mock interview with scoring | ✅ Done |
| Test Prep tracks — IELTS, TOEFL, PTE, OET, CELPIP | ✅ Done |
| AI Writing Coach — GPT-4o grammar + structure feedback | ✅ Done |
| Resume Analyzer — GPT-4o ATS + language scoring | ✅ Done |
| Vocabulary Hub — 550+ academic words + personal saved words | ✅ Done |
| Speech Analysis — Communication Score (fluency, vocab, pace) | ✅ Done |
| Dashboard — level journey, streak, score trend, leaderboard | ✅ Done |
| Mentors — browse profiles, book sessions, follow, apply | ✅ Done |
| Community — threads, replies, upvotes, accept best answer | ✅ Done |
| Jobs — listings + application tracking | ✅ Done |
| PWA — installable, service worker, offline fallback | ✅ Done |
| Gamification — streaks, scores, leaderboard, daily goal | ✅ Done |

---

## V2 — Engagement & Growth

**Goal:** Users return daily and invite others. Retention and viral loops.

### Notifications & Re-engagement
- [ ] Push notifications for streak reminders (PWA + email)
- [ ] Weekly progress digest email (streak summary, top score, tip of the week)
- [ ] "Streak at risk" email 8 hours before midnight

### Social & Sharing
- [ ] Public learner profiles (`/u/{username}`) — stats, streak, level badge
- [ ] Shareable scorecard for Speech Analysis (already has OG image — add share button)
- [ ] "Challenge a friend" — invite link that auto-starts the same Daily Challenge

### Onboarding
- [ ] Goal-setting flow on first login (exam target, daily practice goal, skill focus)
- [ ] Personalized content recommendations based on goal
- [ ] 7-day starter challenge for new users

### Community Improvements
- [ ] Category-filtered notifications ("notify me when someone replies")
- [ ] Moderator tools (pin, remove, report)
- [ ] Weekly "Top Answer" highlight on homepage

---

## V2.1 — Exam Prep Depth

**Goal:** Own the IELTS / TOEFL preparation market segment.

- [ ] IELTS Writing Task 1 & 2 AI grading (band score 1–9 per criterion)
- [ ] IELTS Speaking mock (audio recording → AI band score)
- [ ] TOEFL Integrated Writing prompt practice
- [ ] PTE Speaking "Repeat Sentence" and "Describe Image" tasks
- [ ] OET Letter-writing task with AI clinical English feedback
- [ ] Timed practice tests with real exam format simulation
- [ ] Score progress chart per exam track

---

## V3 — Marketplace & Monetisation

**Goal:** First revenue. Mentors earn, Speechef takes commission.

### Mentor Payments
- [ ] Stripe integration — mentor sets hourly rate, learner pays on booking
- [ ] Speechef takes 15% platform fee
- [ ] Payout dashboard for mentors (earnings, upcoming sessions, reviews)
- [ ] Booking calendar with Google Calendar sync

### Premium Subscription
- [ ] Speechef Pro — unlimited AI tool usage (writing coach, resume analyzer, roleplay sessions)
- [ ] Free tier: 5 AI analyses/month · Pro: unlimited
- [ ] Stripe Billing + webhook integration
- [ ] Upgrade flow from dashboard

### Sponsored Jobs
- [ ] Companies pay to feature job listings
- [ ] "Sponsored" badge on featured listings

---

## V4 — Video & Peer Review

**Goal:** The most powerful speaking practice tool — feedback from humans, not just AI.

### Video Upload & Review
- [ ] Upload a 1–5 min speech video (stored on Cloudflare R2)
- [ ] Community reviews: pace, clarity, filler words, confidence (1–5 scale + written note)
- [ ] Review credits system — earn credits by reviewing, spend credits to get reviewed
- [ ] AI pre-analysis before human review (filler words detected, pace calculated)
- [ ] Review request feed — browse speeches waiting for feedback

### Live Sessions (Post-Mentor Marketplace)
- [ ] Group practice rooms (4–6 participants) — daily Toastmasters-style sessions
- [ ] Facilitator role rotation
- [ ] Session recording and replay

---

## V5 — Mobile App

**Goal:** Mobile-first daily habit. The game must be playable on the bus.

- [ ] React Native app (`speechef.mobile` repo) consuming the same Django REST API
- [ ] Daily streak push notifications (native)
- [ ] Offline word games (local cache)
- [ ] Voice-first game mode (answer by speaking)
- [ ] App Store + Google Play submission

---

## Technical Backlog

These improvements are not user-facing features but make the platform more reliable and scalable.

| Item | Priority |
|---|---|
| GitHub Actions CI — run Django tests + Next.js build on every PR | High |
| Sentry error tracking — Python + JavaScript | High |
| Rate limiting on AI endpoints (prevent abuse) | High |
| Redis caching for vocabulary word list and leaderboard | Medium |
| Database query optimisation (select_related, prefetch_related audit) | Medium |
| End-to-end tests with Playwright (critical flows: register, play game, AI analysis) | Medium |
| Admin dashboard for content moderation (community, mentor applications) | Medium |
| CDN for frontend static assets (already Vercel — ensure cache headers set) | Low |
| API versioning strategy for `/api/v2/` | Low |

---

## Proposal Status Quick Reference

| ID | Feature | Status |
|---|---|---|
| V1.0 | All core features | ✅ Shipped |
| V2.1 | Engagement & notifications | Planned |
| V2.2 | Onboarding flow | Planned |
| V2.3 | Social sharing | Planned |
| V3.1 | IELTS/TOEFL exam depth | Planned |
| V3.2 | Mentor payments (Stripe) | Planned |
| V3.3 | Speechef Pro subscription | Planned |
| V4.1 | Video upload + peer review | Future |
| V4.2 | Live group sessions | Future |
| V5.0 | Mobile app (React Native) | Future |
