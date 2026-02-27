# L1.2 — Add Comment Posting

## Status: Done

## Why
The `Comment` model and the detail template already display comments, but there is
no way for users to post a comment. The form is missing entirely from `learn_detail`.

## What
- Add a comment submission form to `learn/templates/learn/detail.html`
- Create a `post_comment` view or extend `learn_detail` to handle POST
- Only authenticated users can comment; show login prompt otherwise

## Acceptance Criteria
- [x] Comment form visible on post detail page
- [x] Authenticated user can submit a comment
- [x] Comment appears below the post immediately after submission
- [x] Unauthenticated user sees "Log in to comment" prompt
- [x] Empty comments are rejected with a validation error
