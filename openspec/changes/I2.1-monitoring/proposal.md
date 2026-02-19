# I2.1 — Monitoring + Error Tracking

## Status: Done (Sentry + logging coded; UptimeRobot is a manual dashboard step — see tasks.md)

## Why
Without monitoring, production errors are invisible. Users experience broken features
and you only find out when someone reports it manually.

## What
- **Sentry** — Error tracking (free tier covers small apps)
  - Captures Python exceptions with full stack traces
  - Alerts on new errors via email/Slack
- **UptimeRobot** — Free uptime monitoring (pings every 5 min, alerts on downtime)
- **Django logging** — Structured logs to stdout (Railway captures these)

## Acceptance Criteria
- [ ] Sentry SDK installed and configured
- [ ] Test error triggers a Sentry alert
- [ ] UptimeRobot monitor set up for the production URL
- [ ] Django logging configured with INFO level in production
