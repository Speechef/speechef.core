# L10.1 — Learn Pages Bug Fixes & Polish

## Status: Archived

## Problem
Several bugs and UX gaps accumulated across the learn hub and detail page after the course mode implementation.

## Fixes

### Critical
- **`activeCourse` Temporal Dead Zone (page.tsx)** — `activeCourse` was declared at line 252 but used inside the `.sort()` comparator callback called at line 231. A `const` binding is in TDZ until its declaration executes, so the comparator threw `ReferenceError` whenever `posts` had 2+ items. Fixed by moving `const activeCourse` to before `sortedPosts`.

### Logic
- **`post.completed` vs `post.is_completed` ([id]/page.tsx)** — The non-logged-in completion badge checked `post.completed` while the rest of the codebase (Mark Complete button, CourseNavigator, page.tsx) uses `post.is_completed`. The badge always showed "Pending" regardless of actual state. Fixed to `post.is_completed`.
- **"In lesson order" label showing during search (page.tsx)** — Sort row showed locked "📋 In lesson order" chip even when a search query was active in course mode. Fixed condition to `activeCourse && !search` so the sort `<select>` reappears during search.
- **CourseBanner showing "0 chapters" during load (page.tsx)** — `catChapterCount()` returns 0 while `allPosts` is loading. Fixed by destructuring `isLoading: allPostsLoading` from the `allPosts` query and guarding the banner with `!allPostsLoading`.

### UX
- **Bookmark empty state (page.tsx)** — When `showBookmarks=1` and no articles are bookmarked, the empty state showed "No posts in this category yet." Fixed to show "No saved articles yet." with a helpful hint to bookmark while reading.
- **Comment textarea not locked during submit ([id]/page.tsx)** — Submit button had `disabled={submitting}` but the textarea did not. Added `disabled={submitting}` and `disabled:opacity-60 disabled:bg-gray-50` to the textarea.

### Accessibility
- **Missing `aria-label` on search clear button (page.tsx)** — Added `aria-label="Clear search"` to the ✕ button.
- **Missing `aria-label` on sort dropdown (page.tsx)** — Added `aria-label="Sort articles"` to the `<select>`.
- **Missing `aria-label` on TOC links ([id]/page.tsx)** — Added `aria-label="Jump to section: {item.text}"` to each Table of Contents anchor.

## Files
- `frontend/app/(games)/learn/page.tsx` (modified)
- `frontend/app/(games)/learn/[id]/page.tsx` (modified)
