# Tasks — I2.1 Monitoring

## Sentry (Done)
- [x] Add `sentry-sdk==2.3.1` to `backend/requirements.txt`
- [x] Add `import sentry_sdk` to `production.py`
- [x] Init Sentry in `production.py` — only when `SENTRY_DSN` env var is set
      traces_sample_rate=0.2 (20% performance tracing), send_default_pii=False
- [x] Add `SENTRY_DSN=` to `.env.example`
- [x] `python manage.py check` — 0 issues
- [x] All 14 tests still pass

## Django Logging (Done)
- [x] Add structured `LOGGING` config to `settings/base.py`
      - Console handler with verbose formatter (levelname, timestamp, module, pid, thread)
      - Root logger: WARNING and above → console
      - `django` logger: INFO and above → console (no propagate)
      - `speechef` logger: INFO and above → console (app-level logs)
      - Railway captures stdout automatically — no file handlers needed

## Sentry Dashboard (Manual — requires Sentry account)
- [ ] Go to https://sentry.io → New Project → Python → Django
- [ ] Copy the DSN (looks like https://<key>@<org>.ingest.sentry.io/<id>)
- [ ] Add `SENTRY_DSN=<dsn>` to Railway environment variables
- [ ] Trigger a test error to verify capture:
      docker compose run web python manage.py shell -c "raise Exception('Sentry test')"
      → Should appear in Sentry within seconds
- [ ] Configure email alert rule in Sentry: "Alert me on every new issue"

## UptimeRobot (Manual — requires UptimeRobot account)
- [ ] Go to https://uptimerobot.com → Add New Monitor
- [ ] Type: HTTP(s)
- [ ] Friendly name: Speechef API
- [ ] URL: https://<your-railway-domain>.up.railway.app/api/v1/
- [ ] Monitoring interval: every 5 minutes
- [ ] Alert contact: your email
- [ ] Save → verify first check returns "Up"
