# F1.1 Tasks

- [x] `npx create-next-app@latest frontend --typescript --tailwind --app --eslint`
- [x] `npm install axios @tanstack/react-query zustand js-cookie @types/js-cookie`
- [x] `npx shadcn@latest init` — Tailwind v4 detected, components.json written
- [x] Add brand colours (#141c52, #FADB43, #fe9940) to `app/globals.css` @theme block
- [x] Create `app/providers.tsx` — TanStack QueryClientProvider ('use client')
- [x] Update `app/layout.tsx` — Speechef metadata + wrap children in Providers
- [x] Create `lib/api.ts` — Axios instance, JWT request interceptor, 401 redirect
- [x] Create `lib/auth.ts` — login(), logout(), refreshAccessToken(), isAuthenticated()
- [x] Create `stores/auth.ts` — Zustand auth store
- [x] Create `types/index.ts` — User, Profile, Post, GameSession, Job, etc.
- [x] Create route groups: `(public)/`, `(auth)/login/`, `(auth)/register/`, `(app)/dashboard/`
- [x] Port `landing_page.html` to `(public)/page.tsx` using Tailwind (hero, features, testimonials, footer)
- [x] Stub `(auth)/login/page.tsx` and `(auth)/register/page.tsx` (A1.2)
- [x] Create `(app)/layout.tsx` — client-side auth guard (redirect to /login if no token)
- [x] Stub `(app)/dashboard/page.tsx` (F1.5)
- [x] Create `frontend/.env.local` and `frontend/.env.example`
- [x] Add `frontend` service to `docker-compose.yml` (node:20-alpine, port 3000)
- [x] `npm run build` — compiled successfully, all 5 routes static
