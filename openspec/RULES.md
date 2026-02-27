# OpenSpec Rules

OpenSpec is the lightweight change-management system for this project. Every feature, bug fix, or
infrastructure improvement begins as an openspec proposal and is tracked until it is archived.

---

## Directory Layout

```
openspec/
├── RULES.md                          ← this file
├── changes/
│   ├── [ID]-[slug]/
│   │   └── openspec.md               ← the proposal
│   └── archive/
│       └── [YYYY-MM-DD]-[ID]-[slug]/ ← merged proposals
next-openspec.md                      ← master tracker (repo root)
```

---

## Proposal ID Format

```
[Domain][Series].[Sequence]-[slug]
```

| Part       | Rule                                                             |
|------------|------------------------------------------------------------------|
| Domain     | 2–3 letter prefix — see Domain Prefixes table below             |
| Series     | Major version number (resets at 1 for new domains)              |
| Sequence   | Minor number within that series                                  |
| slug       | Lowercase hyphenated description (omit for one-liners)           |

**Examples:** `G3.1`, `LP1.4-landing-learn-practice-cards`, `AI1.3-analysis-frontend-page`

### Domain Prefixes

| Prefix | Area                          |
|--------|-------------------------------|
| A      | API / backend endpoints       |
| AC     | Achievements & badges         |
| AI     | AI analysis                   |
| AN     | Analysis history & UX         |
| B      | Bug fixes                     |
| DB     | Dashboard                     |
| ER     | Expert review panel           |
| F      | Frontend scaffolding           |
| FP     | Forgot password / auth flows  |
| G      | Games & gamification          |
| I      | Infrastructure                |
| INT    | Event wiring / integrations   |
| J      | Jobs board                    |
| JB     | Job board UX                  |
| L      | Learn hub                     |
| LB     | Leaderboard                   |
| LN     | Landing page                  |
| LP     | Landing page sections         |
| M      | Mentors marketplace           |
| MM     | Mentor models & API           |
| MN     | Mobile navigation             |
| MY     | My Applications               |
| N      | Notifications                 |
| PR     | Public profile                |
| PH     | Practice hub                  |
| RP     | Role Play                     |
| RS     | Real-time score               |
| SC     | Scorecard / share             |
| SET    | Settings page                 |
| ST     | Streak                        |
| TP     | Test Prep                     |
| U      | User experience / dashboard   |
| UG     | User growth / profile         |
| WL     | Learn progress / watch-later  |

When adding a new domain, choose a prefix not already in use and add it to the table above.

---

## openspec.md Format

Every proposal lives at `openspec/changes/[ID]-[slug]/openspec.md`.

```markdown
# [ID] — [Title]

## Status: [Status]

## Why
One paragraph explaining the user problem or technical need.

## What
Description of the scope. Use sub-headings for multi-part proposals.
Include ASCII wireframes where helpful.

## Files to Touch
- `path/to/file.ts` — what changes (new / update)
- `path/to/other.py` — what changes

## Done When
- Bullet-point acceptance criteria (observable, testable)
```

### Status Values

| Status               | Meaning                                              |
|----------------------|------------------------------------------------------|
| `Unblocked`          | All dependencies are done — ready to implement       |
| `Blocked → [ID]`     | Waiting on another proposal; list all blockers       |
| `Done`               | Implemented and merged; not yet archived             |
| `Archived`           | Merged, verified, and moved to `archive/`            |

Do **not** invent other status strings. Use exactly these values.

---

## next-openspec.md Rules

`next-openspec.md` (repo root) is the single source of truth for the backlog.

**Line 10** must always be the Unblocked row of the Status Summary table:
```
| Unblocked | N | ID1, ID2, ... |
```
The build workflow reads this line to determine what to implement next.

### Required Sections (in order)

1. **Header** — title + last-updated note
2. **Status Summary table** — Done / Unblocked / Blocked / Archived counts
3. **Dependency Graph** — ASCII tree grouped by phase
4. **All Proposals** — one table per phase/domain, with ID, Title, Status, Blocked By columns

### Keeping it Current

- When a proposal moves from Blocked → Unblocked: update its status in the table and add its ID to line 10.
- When a proposal is implemented: move it from Unblocked to Done in the table; remove from line 10.
- When a proposal is archived: move it to the appropriate `🗄️ Archived` table; update counts.

---

## Lifecycle

```
Idea → openspec.md created (Unblocked or Blocked)
     → dependency satisfied → status becomes Unblocked, added to line 10
     → /openspec-build-next → branch + implementation
     → PR to dev → review → merge → status = Done
     → /openspec-cleanup → archived, next-openspec.md updated
```

### Creating a New Proposal

1. Pick the next available ID in the appropriate domain series.
2. Create `openspec/changes/[ID]-[slug]/openspec.md`.
3. Fill in all sections. Set status to `Unblocked` or `Blocked → [deps]`.
4. Add the entry to `next-openspec.md` — the right phase table and the dependency graph.
5. If unblocked, add the ID to line 10.

### Implementing a Proposal

Use the `/openspec-build-next` Claude command. It:
- Reads line 10 of `next-openspec.md` for the next unblocked ID(s)
- Creates a branch `openspec/[full-id]` (or worktrees for parallel work)
- Implements all tasks described in `openspec.md`
- Pauses for your approval before committing
- Creates a PR to `dev`

### Post-Merge Cleanup

Use the `/openspec-cleanup` Claude command. It:
- Removes worktrees and local branches
- Syncs `main` and `dev`
- Archives the proposal directory (moves to `openspec/changes/archive/YYYY-MM-DD-[ID]/`)
- Updates `next-openspec.md` — removes ID from line 10, updates tables and counts

---

## Implementation Rules

1. **One PR per proposal** — never bundle multiple proposals into one branch.
2. **Branch name** — always `openspec/[full-proposal-id]` (e.g., `openspec/G3.1-vocabulary-blitz`).
3. **PR target** — always `dev`, never `main`.
4. **Pause before commit** — the build workflow stops and shows changed files; you approve explicitly.
5. **Mark tasks done** — check off items in `openspec.md` (`- [x]`) as you finish them.
6. **No node_modules in worktrees** — for JS/TS, build only the needed internal packages; run full
   validation in the main repo after pushing.
7. **Dependencies must be Done** before a Blocked proposal can move to Unblocked.

---

## Writing Good Proposals

- **Why** should name the user pain or technical constraint — not the solution.
- **What** should describe the delta from today's state, not the full feature from scratch.
- **Files to Touch** prevents scope creep — list every file you expect to change.
- **Done When** must be observable: "Page loads without error" not "it works".
- Keep proposals small — one proposal per logical unit of change. If it spans more than ~10 files,
  consider splitting it.
