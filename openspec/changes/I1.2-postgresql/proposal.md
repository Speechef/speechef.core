# I1.2 — Switch to PostgreSQL

## Status: Unblocked

## Why
SQLite is not suitable for production:
- No concurrent writes (games + users hitting DB simultaneously)
- No proper connection pooling
- No JSON field support for future use
- Not available on most PaaS platforms

## What
- Switch development and production database to PostgreSQL
- Use `dj-database-url` to parse `DATABASE_URL` env variable
- Add `psycopg2-binary` driver
- Migrate existing data (for local dev convenience)

## Acceptance Criteria
- [ ] Local development uses PostgreSQL via Docker (I1.3)
- [ ] All migrations apply cleanly on PostgreSQL
- [ ] No SQLite-specific queries remain in the codebase
- [ ] `DATABASE_URL` env variable controls the connection
