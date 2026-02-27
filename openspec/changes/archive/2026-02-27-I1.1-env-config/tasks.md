# I1.1 Tasks

- [ ] `pip install python-decouple`; update `requirements.txt`
- [ ] Create `speechef/settings/base.py` (common settings)
- [ ] Create `speechef/settings/development.py` (DEBUG=True, SQLite)
- [ ] Create `speechef/settings/production.py` (DEBUG=False, Postgres, S3)
- [ ] Update `manage.py` and `wsgi.py`/`asgi.py` to use `speechef.settings.development` by default
- [ ] Create `.env` with:
      SECRET_KEY=<generate new key>
      DEBUG=True
      ALLOWED_HOSTS=localhost,127.0.0.1
      DATABASE_URL=sqlite:///db.sqlite3
- [ ] Create `.env.example` with empty/placeholder values
- [ ] Add `.env` to `.gitignore`
- [ ] Verify `python manage.py runserver` works
- [ ] Run `python manage.py check --deploy` (in prod mode) and resolve all warnings
