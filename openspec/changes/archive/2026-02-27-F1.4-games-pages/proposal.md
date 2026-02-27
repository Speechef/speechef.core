# F1.4 — Frontend Games Pages (Interactive)

## Status: Done

## Why
Games require JavaScript interactivity (card flipping, countdown timers, scramble input)
that Django templates cannot cleanly handle. React components are the right tool.

## Pages/Components
- `/practice` — Game selection hub (existing practice.html ported)
- `/practice/guess-the-word` — React component: fetch question → show options → submit
- `/practice/memory-match` — React component: 12 card grid with CSS flip animation, match logic
- `/practice/word-scramble` — React component: scrambled letters, drag/type to unscramble, timer
- `/practice/leaderboard` — Table of top users, filter by game

## Key Interactions
- **Memory Match**: card flip state managed in `useState`, match detection, attempt counter,
  timer with `useEffect`, result submission on game complete
- **Word Scramble**: draggable letter tiles OR typed input, shuffle algorithm, countdown timer
- **Guess the Word**: radio selection, instant feedback coloring on submit

## Acceptance Criteria
- [ ] All three games fully playable in the browser
- [ ] Score submitted to API on completion (if logged in)
- [ ] Session recorded in GameSession model
- [ ] Leaderboard shows live data from API
- [ ] Responsive on mobile screens
