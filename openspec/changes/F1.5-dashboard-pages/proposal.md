# F1.5 — Frontend Dashboard + Streak UI

## Status: Blocked (requires F1.4, U1.2)

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
- [ ] Dashboard shows real streak from API
- [ ] Recent games list updates after each played game
- [ ] Stats cards show correct aggregated data
- [ ] Recommended card dynamically picks the right game
- [ ] Dashboard requires login (redirect if not authenticated)
