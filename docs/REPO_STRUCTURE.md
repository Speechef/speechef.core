# Repository Structure

## Single Monorepo — One Repo, Two Apps

Everything lives in `speechef.core`. This is the **monorepo**.

```
speechef.core/                   ← monorepo root
│
├── backend/                     (Django — Python)  [PHASE 0 restructure]
│   ├── home/
│   ├── users/
│   ├── learn/
│   ├── practice/
│   ├── jobs/
│   ├── speechef/                ← Django project config
│   ├── templates/
│   ├── static/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                    (Next.js — TypeScript)  [PHASE 7]
│   ├── app/                     ← App Router pages
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/
│   │   │   ├── dashboard/
│   │   │   ├── learn/
│   │   │   ├── practice/
│   │   │   │   ├── guess-the-word/
│   │   │   │   ├── memory-match/
│   │   │   │   └── word-scramble/
│   │   │   └── jobs/
│   │   └── page.tsx             ← Landing page
│   ├── components/
│   │   ├── ui/                  ← shadcn/ui components
│   │   ├── games/               ← MemoryMatch, WordScramble, GuessTheWord
│   │   ├── layout/              ← Navbar, Footer, Sidebar
│   │   └── shared/              ← StreakWidget, ScoreCard, etc.
│   ├── lib/
│   │   ├── api.ts               ← Axios instance + interceptors
│   │   ├── auth.ts              ← JWT helpers
│   │   └── utils.ts
│   ├── hooks/                   ← useAuth, useGameSession, useStreak
│   ├── stores/                  ← Zustand stores
│   ├── types/                   ← TypeScript interfaces mirroring API
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── docs/                        ← Developer documentation
│   ├── VISION.md
│   ├── ARCHITECTURE.md
│   ├── TECH_STACK.md
│   ├── ROADMAP.md
│   ├── REPO_STRUCTURE.md        ← this file
│   └── DEVELOPER_GUIDE.md
│
├── openspec/                    ← Feature proposal tracking
│   └── changes/
│       └── [proposal-id]-[name]/
│           ├── proposal.md
│           └── tasks.md
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml       ← Django tests on every PR
│       └── frontend-ci.yml      ← Next.js lint + build on every PR
│
├── next-openspec.md             ← Feature proposal tracker index
├── docker-compose.yml           ← Local dev: postgres + redis + django
├── Dockerfile                   ← Backend production image
├── .env.example                 ← Required env vars (no values)
├── .gitignore
└── README.md
```

---

## Why One Repo?

| Concern | Monorepo Answer |
|---|---|
| Frontend and backend changes often happen together | One PR covers both |
| Shared type definitions | `types/` in frontend mirrors Django serializers |
| CI/CD complexity | GitHub Actions path filtering runs only the relevant tests |
| Small team | No overhead of syncing multiple repos |
| OpenSpec proposals | One place tracks work across both apps |

### When to Split (Future)
If a mobile app (`React Native`) or a separate microservice is added, those get their own repos:
- `speechef.core` — backend + web frontend (this repo)
- `speechef.mobile` — React Native app (separate repo, consumes same API)

---

## Branch Strategy

```
main          ← production-ready code only, protected
dev           ← integration branch, PRs merged here first
openspec/*    ← one branch per OpenSpec proposal
hotfix/*      ← urgent production fixes, PR directly to main
```

### Rules
- No direct commits to `main` or `dev`
- Every feature starts from `dev` on an `openspec/[id]` branch
- PRs to `dev` require CI to pass
- PRs from `dev` → `main` require manual review
- `main` is auto-deployed to production (Railway + Vercel)

---

## Current State → Target State (Phase 0)

Right now Django files are at the repo root. In **Phase 0** (I1.1), restructure:

```bash
mkdir backend
git mv home users learn practice jobs speechef templates static manage.py requirements.txt backend/
```

This puts Django cleanly in `backend/` and frees the root for the monorepo layout above.
All Docker, CI, and import paths update accordingly.
