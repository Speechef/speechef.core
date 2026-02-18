---
description: Post-merge cleanup - worktrees, branches, sync, archive proposals, update next-openspec.md
---

# Cleanup OpenSpec Proposals

Post-merge housekeeping after PRs have been merged and closed.

## Prerequisites

Confirm with user:
- PRs from feature branches to `dev` are merged and closed
- PR from `dev` to `main` is merged and closed (if applicable)
- Currently in main project directory (not a worktree)

## Step 1: Identify Completed Proposals

Ask user which proposals were completed, or detect from:
```bash
git worktree list
gh pr list --state merged --limit 5
```

## Step 2: Clean Up Worktrees

```bash
# Remove worktrees
git worktree remove ../openspec-kanban-[short-id] --force

# Prune stale references
git worktree prune
```

## Step 3: Clean Up Local Branches

```bash
# Delete merged branches
git branch -d openspec/[full-proposal-id]

# Prune remote tracking branches
git fetch --prune
```

## Step 4: Sync Branches

```bash
# Fetch latest
git fetch origin

# Sync main
git checkout main
git pull origin main

# Sync dev
git checkout dev
git pull origin dev

# If dev is behind main, merge:
git merge main --no-edit
git push origin dev
```

## Step 5: Archive Completed Proposals

Using OpenSpec CLI:
```bash
openspec archive [full-proposal-id] --yes
```

Or manually:
1. Verify all tasks marked `[x]` in tasks.md
2. Update proposal.md status to `complete`
3. Move to archive:
```bash
# PowerShell
$date = Get-Date -Format "yyyy-MM-dd"
Move-Item "openspec/changes/[full-proposal-id]" "openspec/changes/archive/$date-[full-proposal-id]"
```

## Step 6: Update next-openspec.md

Update `next-openspec.md` to reflect:
- Move archived proposals from "Unblocked" to "Archived" section
- Update line 10 with remaining unblocked proposals
- Check which proposals are now unblocked (dependencies satisfied)
- Update Status Summary counts
- Update dependency graph

## Step 7: Commit Housekeeping (PAUSE FOR APPROVAL)

**STOP before committing.** Show user the staged changes and wait for approval.

```bash
git checkout dev
git add openspec/changes/archive/
git add next-openspec.md
git status
```

After approval:
```bash
git commit -m "$(cat <<'EOF'
chore: Archive [proposal-ids] and update next-openspec.md

Archived proposals:
- [list proposals]

Updated next-openspec.md with new unblocked proposals.

[robot] Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

git push origin dev
```

## Checklist

- [ ] PRs verified merged and closed
- [ ] Worktrees removed
- [ ] Local branches deleted
- [ ] main synced
- [ ] dev synced (merged main if needed)
- [ ] Proposals archived
- [ ] next-openspec.md updated
- [ ] Housekeeping committed and pushed
