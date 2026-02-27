# L4.1 — Related Articles on Learn Detail Page

## Status: Unblocked

## Problem
After reading an article, users have no guided path to the next relevant piece of content.

## Solution
Add a "Related Articles" section above the comments on the learn detail page. Fetch `GET /learn/posts/?category=<first-category-name>`, exclude the current post, show up to 3 results as card links. Only shown when the post has at least one category.

## Files
- `frontend/app/(games)/learn/[id]/page.tsx` (modified)
