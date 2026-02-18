# B1.3 — Configure MEDIA_ROOT for Profile Images

## Status: Unblocked

## Why
`users/models.py` defines `image = models.ImageField(upload_to='profile_pics')`.
However, `speechef/settings.py` has no `MEDIA_ROOT` or `MEDIA_URL` configured.
Uploading a profile picture raises a `SuspiciousFileOperation` or silently fails.
The profile template also has `{{ user.profile.image.url }}` commented out.

## What
- Add `MEDIA_ROOT` and `MEDIA_URL` to settings
- Add media URL routing to root `urls.py`
- Uncomment profile image display in `users/templates/users/profile.html`
- Re-enable image resize logic in `users/models.py`

## Acceptance Criteria
- [ ] Profile image upload works end-to-end
- [ ] Image is resized to 300x300 on save
- [ ] Profile page shows the user's avatar
- [ ] Default image (`default.jpg`) is served correctly
