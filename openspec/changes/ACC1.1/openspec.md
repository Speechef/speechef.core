# ACC1.1 — Account Deletion

## Problem
`frontend/app/(app)/settings/page.tsx` danger zone has a hardcoded `alert()`:
```
// TODO: call delete account endpoint when available
alert('Account deletion is not yet available. Please contact support.');
```
No backend endpoint exists to delete a user account.

## Solution

### Backend
Add `DELETE /auth/account/` endpoint:
- Requires auth
- Calls `user.delete()` (Django handles cascade deletion)
- Returns `{"deleted": True}`

### Frontend
Replace the `alert()` in `DangerTab` with:
- A `useMutation` that calls `DELETE /auth/account/`
- On success: call `logout()` from `useAuthStore` + `router.replace('/')`
- On error: show an inline error message

## Files Changed
| File | Change |
|------|--------|
| `backend/users/api_views.py` | Add `delete_account` view |
| `backend/users/api_urls.py` | Add `path("account/", ...)` |
| `frontend/app/(app)/settings/page.tsx` | Wire danger zone to real API |

## No Migration Needed
Account deletion relies on Django's built-in cascade delete.
