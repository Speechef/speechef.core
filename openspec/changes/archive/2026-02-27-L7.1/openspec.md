# L7.1 — Learn Detail Page Redesign

## Status: Archived

## Problem
The detail page rendered post body as raw paragraphs with a flat yellow header band. No reading progress indicator, no table of contents for long articles, and comment authors had no visual identity.

## Solution
Full redesign of `learn/[id]/page.tsx` using existing API fields — no schema changes:

- **Category-coloured hero** — replaces the flat `#FADB43` banner with a gradient (`CATEGORY_META bg → white`) containing category emoji (large), category pills, date, read-time, and "Mark Complete" button (right-aligned). Uses `CATEGORY_META` for per-category colour.
- **`StickyReadingBar`** — fixed bar at the bottom of the viewport showing the next article title and a "→" link. Hidden when there is no next post.
- **Reading progress bar** — 2 px bar pinned to the very top of the page, filled via `scroll` event listener (`window.scrollY / (documentHeight − viewportHeight) × 100`). Uses the primary category colour.
- **Rich body renderer** — two-pass parser that handles:
  - `## Heading` → `<h3>` with anchor ID (used by TOC)
  - `### Sub-heading` → `<h4>`
  - Consecutive `- item` lines → `<ul><li>` list
  - Blank lines → skipped
  - All other lines → `<p>`
  - Special section prefixes (`> Exercise:`, `> Warning:`, `> Tip:`) → styled callout cards
- **`TableOfContents`** sidebar — sticky panel listing all `## ` headings; active item tracked via `IntersectionObserver`; only shown when ≥ 2 headings exist.
- **`ProgressRing`** — SVG ring component used in the course sidebar showing `coursePct %` completion.
- **Confetti animation** — `@keyframes confettiFall` CSS triggered on final lesson completion (`justCompleted` state, 3 s timeout), only fires in `onSuccess` of the complete mutation.
- **Related articles grid** — `grid-cols-1 sm:grid-cols-2` mini-cards with category colour chip above the title.
- **Comment avatars** — first character of `comment.author` shown in a coloured circle derived from `AVATAR_COLORS[charCode % 6]`.
- **`extractTOC(body)`** helper — returns `{ id, text }` array from `## ` lines using `slugify`.
- **`parsePostMeta(body)`** helper — strips `Chapter: N` and `Difficulty: Easy|Medium|Hard` metadata lines from the first 5 lines of the body, returns `{ chapter, difficulty, cleanBody }`.

## Files
- `frontend/app/(games)/learn/[id]/page.tsx` (rewritten)
