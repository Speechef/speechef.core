# F1.1 — Next.js Frontend Setup

## Status: Unblocked

## Why
The current Django template approach limits interactivity for games (card flipping,
timers, scramble input) and prevents building a mobile app later. Moving to Next.js:
- Gives full React component interactivity for games
- SSR/SSG for SEO on landing, learn, and jobs pages
- Shared codebase path to React Native mobile app
- Clean separation of frontend and backend concerns

## What
- Create a `frontend/` directory inside the monorepo (or separate repo)
- Set up Next.js 15 + Tailwind CSS + shadcn/ui components
- Configure API client pointing to Django DRF backend
- JWT token management (httpOnly cookies for security)
- Set up project structure: pages, components, hooks, lib

## Stack
- **Next.js 15** (App Router)
- **Tailwind CSS** + **shadcn/ui** (component library)
- **TanStack Query** (server state, API caching)
- **Zustand** (lightweight client state)
- **Axios** (API client)

## Acceptance Criteria
- [ ] `npm run dev` starts Next.js at `http://localhost:3000`
- [ ] Tailwind CSS working
- [ ] shadcn/ui components installed and working
- [ ] API client configured to call `http://localhost:8000/api/v1/`
- [ ] JWT login flow working (obtain token → store in cookie → use on requests)
- [ ] Landing page renders (static, no API needed)
