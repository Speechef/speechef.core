# U1.1 — Daily Streak Tracking

## Status: Blocked (requires G2.1)

## Why
The Home dashboard has a hardcoded streak UI (3 filled circles, 2 empty) with no real data.
A real streak counter drives daily engagement and habit formation.

## What
- Track consecutive days a user plays at least one game
- Store `current_streak` and `longest_streak` on the user profile or a separate model
- Update streak on each `GameSession` creation
- Render real streak data on the home dashboard

## Streak Logic
- If last session was yesterday → streak += 1
- If last session was today → no change (already counted)
- If last session was 2+ days ago → reset to 1

## Acceptance Criteria
- [ ] Streak increments correctly on consecutive days
- [ ] Streak resets on a missed day
- [ ] Home dashboard shows real streak circles
- [ ] Longest streak is preserved
