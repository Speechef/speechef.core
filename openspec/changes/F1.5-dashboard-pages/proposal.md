# F1.5 — Frontend Dashboard + Streak UI

## Status: Done

## Why
The home dashboard has hardcoded, placeholder UI. This proposal wires it to real data
from the API and replaces all placeholder sections with live content.

## Sections to Build
- **Streak widget** — 7-day circles, current streak count, longest streak
- **Recent games** — Last 5 GameSessions with game name, score, date
- **Stats cards** — Total games played, best score per game
- **Recommended** — Point user to their lowest-scoring game
- **Quick Links** — Navigate directly to each game
- **Coming Soon** — Label video upload and experts sections with roadmap badge

## Acceptance Criteria
- [x] Dashboard shows real streak from API
- [x] Recent games list updates after each played game
- [x] Stats cards show correct aggregated data
- [x] Recommended card dynamically picks the right game
- [x] Dashboard requires login (redirect if not authenticated)
