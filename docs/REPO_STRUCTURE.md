# Repository Structure

## Single Monorepo — One Repo, Two Apps

Everything lives in `speechef.core`. This is the monorepo.

```
speechef.core/                       ← monorepo root
│
├── backend/                         # Django (Python 3.12)
│   │
│   ├── users/                       # Auth, profiles, JWT
│   │   └── models.py                # User, Profile (streak, longest_streak, image)
│   │
│   ├── learn/                       # Recipe Book
│   │   └── models.py                # Post, Category, UserBookmark, UserCompletion
│   │
│   ├── practice/                    # Word games + gamification
│   │   └── models.py                # WordQuestion, GameSession, VocabWord,
│   │                                #   UserVocabProgress, SavedWord, DailyChallenge
│   │
│   ├── roleplay/                    # AI Roleplay (GPT-4o-mini)
│   │   └── models.py                # RoleplaySession (turns as JSONField)
│   │
│   ├── interview/                   # Interview Simulation (GPT-4o-mini / GPT-4o)
│   │   └── models.py                # InterviewSession (turns, overall_score)
│   │
│   ├── writing/                     # AI Writing Coach + Resume Analyzer
│   │   └── models.py                # WritingSession, ResumeSession
│   │
│   ├── analysis/                    # Speech Analysis (Communication Score)
│   │   └── models.py                # AnalysisSession (result: fluency, vocab, pace)
│   │
│   ├── mentorship/                  # Mentor marketplace
│   │   └── models.py                # MentorProfile, MentorBooking,
│   │                                #   MentorFollow, MentorApplication
│   │
│   ├── community/                   # Q&A Forum
│   │   └── models.py                # Thread, Reply, ThreadVote
│   │
│   ├── jobs/                        # Job board
│   │   └── models.py                # Job, Application
│   │
│   ├── testprep/                    # Exam prep content
│   ├── review/                      # Peer speech review (post-V1)
│   ├── home/                        # Dashboard data aggregation
│   │
│   ├── speechef/                    # Django project config
│   │   ├── settings/
│   │   │   ├── base.py              # Shared settings (all envs)
│   │   │   ├── development.py       # Local dev overrides
│   │   │   └── production.py        # Production (Railway)
│   │   ├── urls.py                  # Root URL router
│   │   └── api_urls.py              # API v1 router (/api/v1/)
│   │
│   ├── fixtures/                    # Seed data (vocabulary words, sample posts)
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── entrypoint.sh                # migrate + seed + start gunicorn
│   └── railway.toml                 # Railway deployment config
│
├── frontend/                        # Next.js 16 (TypeScript)
│   │
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx             # Landing page
│   │   │   └── share/               # Shareable scorecard pages
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/[uid]/
│   │   │
│   │   ├── (app)/                   # Auth-guarded pages
│   │   │   ├── dashboard/           # Home dashboard
│   │   │   └── profile/             # User profile + stats
│   │   │
│   │   ├── (games)/                 # Main product pages
│   │   │   ├── learn/               # Recipe Book
│   │   │   │   ├── page.tsx         # Article list + category filter
│   │   │   │   └── [id]/page.tsx    # Article detail
│   │   │   │
│   │   │   ├── practice/            # All practice features
│   │   │   │   ├── page.tsx         # Practice hub
│   │   │   │   ├── vocabulary-blitz/
│   │   │   │   ├── guess-the-word/
│   │   │   │   ├── memory-match/
│   │   │   │   ├── word-scramble/
│   │   │   │   ├── sentence-builder/
│   │   │   │   ├── pronunciation-challenge/
│   │   │   │   ├── daily-challenge/
│   │   │   │   ├── vocab-list/       # Academic vocabulary tracker
│   │   │   │   ├── saved-words/      # Personal saved words
│   │   │   │   ├── writing-coach/    # AI Writing Coach
│   │   │   │   ├── resume-analyzer/  # Resume / ATS analyzer
│   │   │   │   ├── interview/        # Text-based interview sim
│   │   │   │   ├── leaderboard/
│   │   │   │   ├── roleplay/
│   │   │   │   │   └── [mode]/       # job_interview, presentation, debate, small_talk
│   │   │   │   │       ├── page.tsx  # Mode intro / setup
│   │   │   │   │       └── session/  # Live conversation UI
│   │   │   │   └── test-prep/
│   │   │   │       └── [exam]/       # ielts-academic, toefl-ibt, pte-academic, oet, celpip
│   │   │   │
│   │   │   ├── analyze/             # Speech analysis / Communication Score
│   │   │   │
│   │   │   ├── mentors/             # Mentor directory
│   │   │   │   ├── page.tsx         # Browse mentors
│   │   │   │   ├── [id]/page.tsx    # Mentor profile + booking
│   │   │   │   └── apply/           # Apply to become a mentor
│   │   │   │
│   │   │   ├── community/           # Q&A Forum
│   │   │   │   ├── page.tsx         # Thread list
│   │   │   │   ├── [id]/page.tsx    # Thread detail + replies
│   │   │   │   └── new/             # Create thread
│   │   │   │
│   │   │   └── jobs/
│   │   │       ├── page.tsx         # Job listings
│   │   │       └── applications/    # User's applications
│   │   │
│   │   ├── api/
│   │   │   └── og/scorecard/[sessionId]/  # OG image for shareable scorecards
│   │   │
│   │   └── offline/                 # PWA offline fallback
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── layout/                  # Navbar (with auth state)
│   │   └── dashboard/               # ScorecardWidget, etc.
│   │
│   ├── lib/
│   │   └── api.ts                   # Axios instance with JWT interceptors
│   │
│   ├── stores/
│   │   └── auth.ts                  # Zustand auth store (isLoggedIn, user)
│   │
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   ├── sw.js                    # Service worker (cache-first + offline fallback)
│   │   └── icons/                   # App icons (192×192, 512×512)
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── docs/
│   ├── VISION.md                    # Product vision + V1 feature set
│   ├── ARCHITECTURE.md              # System design, data flows, schema
│   ├── TECH_STACK.md                # Package choices and rationale
│   ├── REPO_STRUCTURE.md            # This file
│   └── ROADMAP.md                   # V1 shipped · V2+ pipeline
│
├── openspec/changes/                # Feature proposal history (one folder per proposal)
│
├── .github/workflows/
│   ├── backend-ci.yml               # Django tests on every PR
│   └── frontend-ci.yml              # Next.js lint + build on every PR
│
├── docker-compose.yml               # Local dev: all 5 services
├── dev.sh                           # One-command stack launcher (Colima)
├── .env.example                     # All required env variables (no values)
├── .gitignore
└── README.md
```

---

## Why One Repo?

| Concern | Monorepo Answer |
|---|---|
| Frontend and backend changes often happen together | One PR covers both |
| Shared type definitions | TypeScript interfaces in `frontend/` mirror Django serializers |
| CI/CD | GitHub Actions path filtering: backend tests only when `backend/` changes |
| Small team | No overhead of syncing multiple repos |

### When to Split

If a mobile app or standalone microservice is added, it gets its own repo:
- `speechef.core` — backend + web frontend (this repo)
- `speechef.mobile` — React Native (separate repo, same API)

---

## Branch Strategy

```
main          ← production-ready · protected · auto-deploys to Railway + Vercel
dev           ← integration branch · PRs merge here first
feature/*     ← one branch per feature (replaces openspec/* naming)
hotfix/*      ← urgent production fixes · PR directly to main
```

### Rules
- No direct commits to `main`
- Every feature starts a `feature/` branch from `dev` (or `main` for hotfixes)
- CI must pass before any PR can merge
- `dev → main` requires manual review
- `main` auto-deploys to production on merge

---

## Key Files Quick Reference

| File | What it does |
|---|---|
| `backend/speechef/api_urls.py` | Registers all API route prefixes under `/api/v1/` |
| `backend/speechef/settings/base.py` | INSTALLED_APPS list — add new apps here |
| `backend/entrypoint.sh` | Runs migrations + seed before starting gunicorn |
| `frontend/lib/api.ts` | Axios instance — auto-attaches `Authorization: Bearer` token |
| `frontend/stores/auth.ts` | Zustand store — `isLoggedIn`, user data, token refresh |
| `frontend/app/layout.tsx` | Root layout — PWA manifest link + SW registration script |
| `docker-compose.yml` | Defines all local dev services and their env variables |
| `.env.example` | Copy to `.env` — required before running locally |
