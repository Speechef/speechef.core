# J5.1 — Jobs Keyword Search Bar

## Status: Unblocked

## Problem
The jobs page has remote and employment-type filters but no text search. Users cannot quickly find jobs by title or company name.

## Solution
Add a keyword search input above the filter dropdowns. Client-side filter: `jobs.filter(j => j.title.toLowerCase().includes(search) || j.company.toLowerCase().includes(search))`. Applied after the existing remote/type filters. Show result count when search is active.

## Files
- `frontend/app/(games)/jobs/page.tsx` (modified)
