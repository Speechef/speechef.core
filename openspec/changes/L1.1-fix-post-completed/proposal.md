# L1.1 — Fix post.completed Field in Learn Templates

## Status: Unblocked

## Why
`learn/templates/learn/index.html` references `post.completed` and uses it to display
a "Completed / Pending" badge. However, the `Post` model in `learn/models.py` has no
`completed` field. This causes a silent template error (empty badge) and broken
category filter links for "Completed" and "Pending".

## Options
### Option A (Recommended): Add completed field to Post
- Add `completed = models.BooleanField(default=False)` to `Post`
- Create a migration
- Use existing template logic as-is

### Option B: Remove the badge from the template
- Remove `completed` references from the template
- Remove the "Completed / Pending" sidebar links

## Acceptance Criteria
- [ ] Learn index page renders without template errors
- [ ] "Completed" and "Pending" status correctly reflected (Option A)
  OR badge is cleanly removed (Option B)
- [ ] Admin can toggle completed status on posts
