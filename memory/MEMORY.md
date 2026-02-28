# Speechef Core — Project Memory

## Stack
- **Backend**: Django REST Framework, OpenAI SDK (`gpt-4o` quality, `gpt-4o-mini` speed)
- **Frontend**: Next.js 16.1.6, React 19, @tanstack/react-query, Zustand, Tailwind CSS
- **API prefix**: `/api/v1/` — registered in `backend/speechef/api_urls.py`
- **Auth**: JWT via `rest_framework_simplejwt`, token in `Cookies.get('access_token')`
- **API client**: `frontend/lib/api.ts` (axios, auto-attaches Bearer token)
- **Auth store**: `@/stores/auth` → `useAuthStore()`

## Architecture patterns
- Each feature is a separate Django app; register in `INSTALLED_APPS` + `api_urls.py`
- OpenAI client: `OpenAI(api_key=settings.OPENAI_API_KEY)` — wrap in try/except at module level
- JSON responses from GPT: strip ``` fences with `_parse_json_response(raw)` helper
- Frontend pages: `'use client'`, `useQuery` + `useMutation` from `@tanstack/react-query`
- Brand: `primary: '#141c52'`, `gradient: 'linear-gradient(to right,#FADB43,#fe9940)'`
- Background: `#f4f6fb` on page, white cards with `border-gray-100`

## Implemented apps (as of March 2026)
| App | Key endpoints |
|-----|--------------|
| `writing` | `POST /writing/analyze/`, `POST /writing/resume/analyze/`, sessions lists |
| `interview` | `POST /interview/start/`, `POST /interview/<id>/answer/`, `POST /interview/<id>/finish/` |
| `community` | CRUD threads, replies, toggle votes, accept reply |
| `practice` (extended) | `GET/POST /practice/saved-words/`, `DELETE /practice/saved-words/<id>/` |

## Frontend routes added
- `/practice/writing-coach` — AI Writing Coach
- `/practice/resume-analyzer` — Resume / CV Analyzer
- `/practice/saved-words` — Personal vocabulary list
- `/practice/interview` — Text-based interview sim
- `/community` — Thread list + category filter
- `/community/[id]` — Thread detail + replies + vote
- `/community/new` — Create thread
- `/offline` — PWA offline fallback

## PWA
- `frontend/public/manifest.json` — standalone display, theme `#141c52`
- `frontend/public/sw.js` — network-first API, cache-first static, offline fallback
- `frontend/app/layout.tsx` — manifest link + inline SW registration script

## Migrations
Latest practice migration: `0006_savedword`
New apps: `writing`, `interview`, `community` each have `0001_initial`
