---
description: Build OpenSpec proposals with branches, worktrees, implementation, and PRs
allowed-tools: AskUserQuestion
---

# Build Next OpenSpec Proposals

Implement unblocked OpenSpec proposals using git worktrees with a two-stage workflow for JS/TS projects.

## Step 0: Determine How Many Proposals

**If `$ARGUMENTS` is provided and is a number (1, 2, or 3):** Use that as the count.

**Otherwise:** Use the AskUserQuestion tool to ask the user:

```
Question: "How many proposals would you like to implement?"
Header: "Count"
Options:
  - label: "1 proposal"
    description: "Single focused implementation"
  - label: "2 proposals (Recommended)"
    description: "Parallel work in separate worktrees"
  - label: "3 proposals"
    description: "Maximum parallel work"
```

## Step 1: Determine Which Proposals to Implement

Read line 10 from `next-openspec.md` in the current project directory. Line 10 contains the unblocked proposals in format:
```
| Unblocked | N | A3.2, U4.1, U4.3, ... |
```

Extract the **first N** proposal IDs from this line (where N is the count from Step 0).

## Step 2: Find Full Proposal IDs

For each short ID (e.g., `A3.2`), find the full proposal directory name:
```bash
ls -d openspec/changes/A3.2-* 2>/dev/null | head -1
```

## Step 3: Create Branch(es)

### Single Proposal (count = 1)

Work directly in the main repo on a branch - **no worktree needed**:
```bash
# Create and checkout branch from dev
git checkout -b openspec/[full-proposal-id] dev
# OR if branch exists:
git checkout openspec/[full-proposal-id]
```

### Multiple Proposals (count = 2 or 3)

Use worktrees for parallel work:
```bash
# For each proposal:
# Create branch from dev
git branch openspec/[full-proposal-id] dev

# Create worktree in parent directory
git worktree add ../[project-name]-[short-id] openspec/[full-proposal-id]
```

## Step 4: Implement Each Proposal

Read and implement (in main repo for single proposal, or in worktrees for multiple):
- `openspec/changes/[proposal-id]/proposal.md` - Why and what
- `openspec/changes/[proposal-id]/tasks.md` - Implementation checklist
- `openspec/changes/[proposal-id]/specs/*/spec.md` - Delta specifications

### For JS/TS Projects (node_modules)

**DO NOT run full `npm install` in worktrees** - wastes disk space and CPU.

Instead, for typecheck validation:
1. Build only the internal packages needed:
   ```bash
   npm run build --workspace=packages/[package-name]
   ```
2. Run typecheck on modified packages:
   ```bash
   npm run typecheck --workspace=@scope/[package-name]
   ```

The pre-commit hooks (lint-staged) will run eslint on staged files during commit.

### For Python Projects

Python projects don't have this issue - dependencies are typically in a shared venv.

Mark tasks complete as you finish: `- [x]`

## Step 5: Commit and Push (PAUSE FOR APPROVAL)

**STOP before committing.** Show the user which files were modified and wait for explicit approval.

After approval:
```bash
git add -A
git commit -m "feat: [Proposal Title] (#[PR-number])

[Summary of changes]

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

git push -u origin openspec/[proposal-id]
```

Pre-commit hooks will run eslint/prettier on staged files. Fix any errors before retrying.

## Step 6: Validate (JS/TS Only)

### Single Proposal
Already in main repo - run full validation directly:
```bash
npm run lint
npm run test
npm run build
```

### Multiple Proposals (Worktrees)
After pushing from worktree, checkout branch in main repo for full validation:
```bash
# In main repo (not worktree)
cd [main-repo-path]
git fetch origin
git checkout openspec/[proposal-id]

# Full lint and test suite (all dependencies available)
npm run lint
npm run test
npm run build
```

Fix any issues found, commit, and push again.

## Step 7: Create Pull Requests

After validation passes, create PRs to `dev`:
```bash
gh pr create --base dev --head openspec/[proposal-id] \
  --title "feat: [Title] ([short-id])" \
  --body "$(cat <<'EOF'
## Summary
- [Changes]

## OpenSpec Proposal
- ID: [full-proposal-id]

## Test Plan
- [ ] Lint passes
- [ ] Tests pass
- [ ] Build succeeds

🤖 Generated with Claude Code
EOF
)"
```

## Step 8: Cleanup

After PR is merged:

### Single Proposal
```bash
# Switch back to dev
git checkout dev
git pull origin dev

# Delete local branch
git branch -d openspec/[proposal-id]
```

### Multiple Proposals (Worktrees)
```bash
# Remove worktree
git worktree remove ../[project-name]-[short-id]

# Delete local branch
git branch -d openspec/[proposal-id]
```

## Important Rules

1. **Single proposal = main repo branch**: No worktree needed, work directly on branch
2. **Multiple proposals = worktrees**: Use separate worktrees for parallel work
3. **Minimal worktree setup**: Don't install full node_modules - build only what's needed
4. **STOP before committing**: Wait for user approval
5. **Branch naming**: `openspec/[full-proposal-id]`
6. **PR target**: Always `dev` branch
7. **Python is simpler**: No two-stage needed - shared venv works fine
