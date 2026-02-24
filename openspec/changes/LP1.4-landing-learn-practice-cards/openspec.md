# LP1.4 — Landing Page: Learn + Practice Preview Cards

## Status: Blocked → LP1.1

## Why
The landing page needs to surface the Learn and Practice sections to drive users towards habit-forming content. Card grids with visible filter tags communicate depth without overwhelming.

## What
Two distinct sections on the landing page previewing the Learn hub and Practice suite.

### Learn Preview Section
- Headline + subheadline
- Card grid (2×3 on desktop, 1 col on mobile) showing content types:
  - Articles, Video Lessons, Audio Guides, Checklists, Courses
- Visible filter tag row: `IELTS` · `TOEFL` · `Business` · `Public Speaking` · `Accent Reduction` · `Interview Prep`
- CTA: `Explore the Learning Hub →` → `/learn`

### Practice Preview Section
- Headline: *"Practice the way you play"*
- 3-column card layout:
  - Word Games (existing: Guess the Word, Memory Match, Word Scramble)
  - Role Play (Job Interview, Debate, Small Talk AI — future)
  - Test Prep (IELTS, TOEFL, PTE, OET — links to `/practice/test-prep`)
- CTA: `Start Practicing Free →` → `/practice`

### Expert Panel Review Teaser (dark card)
- Separate, visually distinct premium card (dark background)
- 48-hr turnaround, written + video feedback, from $9/review
- Expert panel carousel: 3 expert cards with photo, rating, specialty
- CTA: `Submit for Expert Review →` → `/review`

## Files to Touch
- `frontend/app/(public)/page.tsx` — add all three sections
- `frontend/components/landing/LearnPreview.tsx` (new)
- `frontend/components/landing/PracticePreview.tsx` (new)
- `frontend/components/landing/ExpertReviewTeaser.tsx` (new)
- `frontend/components/landing/ExpertCard.tsx` (new)

## Done When
- All three sections render correctly on the landing page
- Filter tags on learn preview are styled but not yet functional (static)
- Practice card links go to existing `/practice` routes (games work)
- Expert review teaser links to `/review` (page can be a stub at this point)
- Fully responsive on mobile
