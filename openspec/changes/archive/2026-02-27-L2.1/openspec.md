# L2.1 — Learn Hub Search

## Status: Unblocked

## Summary
Add keyword search to the learn posts endpoint and a search bar to the learn frontend.

## Backend
- `learn/api_views.py` posts view: add `?search=` param → case-insensitive filter on title + body

## Frontend
- `frontend/app/(games)/learn/page.tsx`: add a search input above the posts list
  - Debounced 300ms
  - Passes `search` param to query
  - Shows "No results for '...'" empty state when nothing found
