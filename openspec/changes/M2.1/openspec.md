# M2.1 — Mentor Keyword Search + Sort

## Summary
Add a keyword search input and sort dropdown to the mentors listing page so users can quickly find the right mentor.

## Motivation
The mentor list has specialty/language dropdowns but no free-text search. Users looking for a specific mentor by name, or wanting to sort by price or rating, have no way to do this currently.

## Changes

### Frontend — `frontend/app/(games)/mentors/page.tsx`
- Add `search` state (string)
- Add `sortBy` state (`'rating' | 'price_asc' | 'price_desc'`)
- Add search input above the filter dropdowns (client-side filter)
- Add sort dropdown next to the existing filters
- Client-side filter: match on `name`, `bio`, or any `specialties` entry
- Client-side sort: rating descending, price ascending, price descending
- Show result count when searching

## Dependencies
None — purely frontend, uses already-fetched data.

## Status
Done
