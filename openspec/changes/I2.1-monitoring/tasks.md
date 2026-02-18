# I2.1 Tasks

- [ ] `pip install sentry-sdk`; update `requirements.txt`
- [ ] Add to `settings/production.py`:
      import sentry_sdk
      sentry_sdk.init(dsn=env('SENTRY_DSN'), traces_sample_rate=0.2)
- [ ] Add `SENTRY_DSN` to Railway env vars and `.env.example`
- [ ] Trigger a test error to verify Sentry capture
- [ ] Add Django LOGGING config to `settings/base.py` (INFO → console handler)
- [ ] Create UptimeRobot account → add HTTP monitor for production URL → set email alert
