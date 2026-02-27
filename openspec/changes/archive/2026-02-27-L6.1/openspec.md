# L6.1 — Learn Hub Visual Redesign

## Status: Archived

## Problem
The learn hub was a plain list of articles with a basic sidebar and no visual hierarchy. All posts looked identical regardless of category, and there was no way to quickly spot featured or important content.

## Solution
Full visual overhaul of `learn/page.tsx` using only existing API fields — no schema changes:

- **Learning Paths carousel** — horizontal scroll row of course cards (Grammar, Pronunciation, Fluency, Vocabulary, Communication, Writing) with emoji, level badge, lesson/chapter count, and completion progress ring. Clicking a card enters course mode.
- **Stats strip** — three `StatChip` components below the heading: total articles, category count, completion percentage (logged-in only).
- **FeaturedHero** — most recently published article shown as a large hero card above the grid. Includes category emoji + colored band, full title, auto-generated excerpt, read-time badge, "New" pill, bookmark button, and completion badge.
- **CATEGORY_META constant** — maps each category name to `{ bg, text, border, emoji }` for consistent colour/emoji treatment across all components.
- **2-column article grid** — replaced the `space-y-4` list with `grid grid-cols-1 md:grid-cols-2 gap-4`. Each `ArticleCard` has a coloured header band, category pill, excerpt, read-time + date footer, bookmark button, and completion/new badge.
- **Sidebar category counts** — each filter tab shows `(n)` count derived from `allPosts`.
- **Loading skeletons** — updated to match 2-col grid layout.
- **`getExcerpt(body, maxLen)`** helper — strips `## ` headings and `- ` bullet prefixes before slicing.
- **`readTime(body)`** helper — word count ÷ 200, minimum 1 min.

## Files
- `frontend/app/(games)/learn/page.tsx` (rewritten)
