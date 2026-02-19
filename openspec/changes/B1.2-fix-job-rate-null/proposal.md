# B1.2 — Fix job_rate Null Constraint

## Status: Done

## Why
`jobs/models.py` defines `job_rate = models.IntegerField(blank=True)`.
`blank=True` only affects form validation — it does NOT allow NULL at the database level.
Saving a Jobs instance without `job_rate` will raise an `IntegrityError`.

## What
- Add `null=True` to `job_rate` field
- Create and run a migration

## Acceptance Criteria
- [x] `Jobs` can be saved without a `job_rate`
- [x] Migration created and applied cleanly
- [x] No data loss on existing records
