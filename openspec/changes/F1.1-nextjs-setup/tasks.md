# F1.1 Tasks

- [ ] `npx create-next-app@latest frontend --typescript --tailwind --app`
- [ ] `cd frontend && npx shadcn@latest init`
- [ ] Install deps: `npm install axios @tanstack/react-query zustand js-cookie`
- [ ] Create `frontend/lib/api.ts` — Axios instance with baseURL from env + JWT interceptors
- [ ] Create `frontend/lib/auth.ts` — login(), logout(), getToken() helpers
- [ ] Create `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- [ ] Add `frontend/.env.local` to `.gitignore`
- [ ] Create `frontend/.env.example`
- [ ] Set up `TanstackQueryProvider` in `frontend/app/layout.tsx`
- [ ] Port `landing_page.html` to `frontend/app/page.tsx` using Tailwind
- [ ] Test: landing page loads at localhost:3000
- [ ] Configure CORS in Django `settings/development.py`:
      CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
