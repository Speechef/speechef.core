# UX Counter Plan — Speechef Simplification

> **Goal:** Any user — regardless of age, language background, or tech experience — can open the app, understand what to do next, and make meaningful progress within 60 seconds.

---

## 1. Current State Audit

### Navigation (current: 8 items)

| Current label | Problem |
|---|---|
| Home / Dashboard | Unclear distinction |
| Kitchen (Practice) | Cooking metaphor — confusing for ESL users |
| Recipe Book (Learn) | Same — non-obvious |
| AI Sous Chef tools | Buried, jargon |
| Mentors | 5th tap away |
| Community | 6th tap away |
| Jobs | 7th tap away |
| Profile / Me | 8th tap |

**Impact:** A new user sees 8 equal-weight options. No clear "start here."

### Practice hub (current: 20+ options visible at once)

Word games · Daily Challenge · Vocabulary Blitz · Guess the Word · Word Scramble · Memory Match · Sentence Builder · Roleplay · Interview · Test Prep · Writing Coach · Resume Analyzer · Speech Analysis · Vocabulary Hub · Saved Words · Session History · Leaderboard · … and more.

**Impact:** Overwhelming. Users freeze, tap randomly, or leave.

### Cooking metaphors (current — full list)

| Current label | User experience |
|---|---|
| Kitchen Drills | What does a kitchen have to do with English? |
| Recipe Book | I want to learn, not cook |
| AI Sous Chef | Requires knowing what a sous chef is |
| Kitchen Score | Confusing metric name |
| Chef's Toolkit | Non-obvious |
| Prep your ingredients | Distracting metaphor |

### After-activity flow (current)

After every game: 3–4 links appear simultaneously (Play Again · View history · More Games · Back to Practice). No clear next step.

### Onboarding (current: none)

User lands on Dashboard with no context. Streak shows 0. Score shows 0. No prompt for what to do.

---

## 2. Counter Plan

### 2.1 Navigation — reduce to 4 items

| Tab | Icon | What it does |
|---|---|---|
| **Home** | house | Daily plan card — one button, always |
| **Learn** | book | Articles + lessons (was Recipe Book) |
| **Practice** | gamepad | All games and AI tools |
| **Me** | person | Profile, streak, progress, settings |

Everything else (Mentors, Community, Jobs) accessible via Home card shortcuts or Me > Explore.

### 2.2 Three-screen onboarding (new users only)

**Screen 1 — Goal**
> "What do you want to improve?"
- Speaking in conversations
- Writing emails and documents
- Preparing for IELTS / TOEFL / PTE
- Job interviews in English

**Screen 2 — Level**
> "How would you describe your English right now?"
- I know very little (Beginner)
- I can have simple conversations (Intermediate)
- I speak well but want to improve (Advanced)

**Screen 3 — Time**
> "How much time can you spend each day?"
- 5 minutes
- 15 minutes
- 30 minutes or more

On completion: set `onboarding_complete = true` in profile. Never show again.

### 2.3 Home screen — one card, one button

```
+------------------------------------------+
|  Good morning, [Name]                    |
|                                          |
|  Today's plan                            |
|  [ ] Quick vocab game   (3 min)          |
|  [ ] Read one article   (5 min)          |
|  [ ] Roleplay practice  (5 min)          |
|                                          |
|  [ Continue →  ]   ← single CTA         |
|                                          |
|  Streak: 7 days  |  Score: 340           |
+------------------------------------------+
```

"Continue" always takes user to the next incomplete item in today's plan. No decision required.

### 2.4 Practice hub — 3 collapsed groups

On first visit, show only group 1. Groups 2 and 3 are collapsed with a "Show more" toggle.

**Group 1 — Quick (5 min)**
- Guess the Word
- Word Scramble
- Memory Match
- Daily Challenge

**Group 2 — Deep (15–20 min)**
- Vocabulary Blitz
- Sentence Builder
- AI Roleplay
- Interview Simulation

**Group 3 — Exam / Career**
- Test Prep (IELTS · TOEFL · PTE · OET · CELPIP)
- Writing Coach
- Resume Analyzer
- Speech Analysis

### 2.5 Remove all cooking metaphors

| Remove | Replace with |
|---|---|
| Kitchen Drills | Practice Games |
| Recipe Book | Learn |
| AI Sous Chef | AI Tools |
| Kitchen Score | Your Score |
| Chef's Toolkit | Tools |
| Prep your ingredients | Get started |
| Daily Dish | Daily Challenge |
| Kitchen leaderboard | Leaderboard |
| Your Kitchen | Practice Hub |
| Flavour your writing | Improve your writing |
| Add to your menu | Add to your list |
| Taste test | Quick check |
| Cook your sentences | Build sentences |
| Spice up your vocab | Grow your vocabulary |
| Kitchen streak | Daily streak |

### 2.6 After-activity flow — one next step

Replace the current multi-link completion screens with a single contextual CTA:

| Game completed | Next step shown |
|---|---|
| Vocabulary Blitz | "Practice in a sentence →" (Sentence Builder) |
| Guess the Word | "Try Memory Match →" |
| Word Scramble | "Save new words →" (Vocabulary Hub) |
| Memory Match | "Play again →" |
| Sentence Builder | "See your AI feedback →" (Writing Coach) |
| Roleplay | "Try an interview →" (Interview Sim) |
| Interview | "Review your vocabulary →" (Vocab Hub) |
| Test Prep | "Continue this track →" (same exam, next section) |
| Writing Coach | "Review saved words →" |

Secondary links (view history, back to games) shrink to small grey text below the primary CTA. They exist but don't compete for attention.

### 2.7 Progress page — visible from day 1

Current problem: progress page shows empty state until user has completed many activities.

New approach: show the journey as a path, not a score.

```
Your path:
  [1] Foundation   — 0 / 10 lessons     < user is here
  [2] Conversations — locked
  [3] Fluency       — locked
  [4] Advanced      — locked
```

The path makes progress visible immediately (user is at step 1 of 4, not "0%").

### 2.8 Progressive feature disclosure

| Feature | When it unlocks |
|---|---|
| Basic word games | Day 1 |
| AI Roleplay | After 5 practice sessions |
| Interview Simulation | After first Roleplay session |
| Writing Coach | After completing 3 Learn articles |
| Resume Analyzer | After Writing Coach session |
| Test Prep | After choosing "exam" goal in onboarding |
| Mentors | After 7-day streak |
| Community | After 3 sessions total |
| Jobs | After completing first Interview Simulation |
| Speech Analysis | After first Roleplay session |

### 2.9 Accessibility minimums

- All font sizes: minimum 16px (no `text-xs` for primary content)
- All tap targets: minimum 48×48px
- Every icon always paired with a text label — no icon-only buttons
- Error states: specific message + what to do next (not just "Something went wrong")
- Color: never convey meaning by color alone — always add icon or label

---

## 3. Implementation Priority

### Phase 1 — No backend needed (pure frontend)
1. Replace all cooking metaphors (15 label changes)
2. Collapse practice hub into 3 groups
3. Simplify after-activity CTAs to one primary + small secondary links
4. Fix nav to 4 items (hide Community/Jobs/Mentors in Me > Explore)

### Phase 2 — Light backend
5. Onboarding flow (3 screens → save goal + level to Profile)
6. Home screen daily plan card (generate plan from onboarding choices)

### Phase 3 — Full rebuild
7. Progressive feature disclosure (unlock gates tied to session counts)
8. Progress path page (4-tier journey)
9. After-activity personalized next-step routing

---

## 4. What Not to Change

- The brand colours (`#141c52` navy + `#FADB43` gold) — strong and consistent
- The SpeechefMeter ring — the best visual element in the app, keep everywhere
- The card-based layout — clean, works well on mobile
- Game mechanics — the games themselves are well-designed; only navigation around them needs fixing
- AI quality — GPT-4o scoring is genuinely useful, just buried

---

## 5. Success Metrics

| Metric | Current baseline | Target after Phase 1–2 |
|---|---|---|
| Time to first game (new user) | Unknown | < 60 seconds |
| Day 2 retention | Unknown | +15% |
| Practice sessions per visit | Unknown | +20% |
| Support questions about navigation | Unknown | -50% |
| Avg sessions before first Roleplay | Unknown | -30% (fewer drop-offs) |
