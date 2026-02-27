# PG1.1 — Add /progress to Navbar

## Problem
The `/progress` dashboard was implemented but is not linked from the main
navigation. Users have no discoverable path to their personal analytics page.

## Solution
Add a "Progress" link to `NAV_LINKS` in `Navbar.tsx` so it appears in the
desktop nav bar (between Practice and Jobs) and the mobile hamburger menu.

## Files Changed
| File | Change |
|------|--------|
| `frontend/components/layout/Navbar.tsx` | Add `{ href: '/progress', label: 'Progress' }` to `NAV_LINKS` |

## No Backend Changes
Pure frontend — no API, no migration.
