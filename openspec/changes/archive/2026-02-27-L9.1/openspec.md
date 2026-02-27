# L9.1 — Course Mode & Grammar Learning Path

## Status: Archived

## Problem
The Learning Paths carousel existed as a visual element only. Clicking a course card had no effect — there was no course-filtered view, no chapter grouping, no lesson-order navigation, and no completion tracking at the course level.

## Solution
Full course mode implementation across both learn pages — no new API endpoints, URL-state driven:

### URL State
`?cat=Grammar` activates course mode for the Grammar course. `activeCourse = COURSES.find(c => c.category === activeCategory)` detects the active course on every render.

### `CourseBanner` (learn/page.tsx)
Large banner shown at the top of the course view (hidden during search). Displays:
- Course emoji, name, description
- Level badge + "Featured Course" star pill
- Chapter count + lesson count
- Per-user progress bar (`completedPosts / totalPosts × 100 %`)

### `ChapterGroupedGrid` (learn/page.tsx)
Replaces the flat 2-col grid in course mode. Groups posts by chapter using `parsePostMeta`, renders a chapter divider header (chapter number + `CHAPTER_NAMES` label + lesson count + difficulty distribution pills) followed by a 2-col grid of that chapter's `ArticleCard`s.

### `CourseNavigator` (learn/[id]/page.tsx)
Sidebar widget shown when viewing a post that belongs to a course:
- Course header with emoji, name, level badge
- `ProgressRing` SVG showing `coursePct %`
- Progress dot strip (one dot per lesson, coloured by completion + chapter-aware tooltip)
- Prev / Next lesson links
- "🎉 Course Complete!" chip when all lessons done
- Expandable lesson list grouped by chapter with `CHAPTER_NAMES` headers and `DifficultyBadge` per lesson

### `CourseCompletionBanner` (learn/[id]/page.tsx)
Trophy banner shown on the final lesson after completion. Displays course name, total lessons, chapter count, cumulative read time, and a "← Back to course" CTA link.

### `DifficultyBadge` component (both pages)
Small coloured pill (`🟢 Easy` / `🟡 Medium` / `🔴 Hard`) in two sizes (`xs`, `sm`). Used in `ArticleCard` header band, `FeaturedHero`, `CourseNavigator` lesson list, and `ChapterGroupedGrid` chapter headers.

### `CHAPTER_NAMES` constant (both pages)
Maps chapter numbers 1–6 to descriptive names: The Basics, Nouns & Articles, Pronouns & Adjectives, Tenses, Sentence Structure, Advanced Grammar.

### Lesson Order
When `activeCourse` is set, `sortedPosts` forces oldest-first (`created_on` ascending) so lesson numbers match the intended chapter sequence.

## Files
- `frontend/app/(games)/learn/page.tsx` (modified)
- `frontend/app/(games)/learn/[id]/page.tsx` (modified)
