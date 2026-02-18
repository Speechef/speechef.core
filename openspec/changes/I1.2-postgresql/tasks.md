# I1.2 Tasks

- [ ] `pip install psycopg2-binary dj-database-url`; update `requirements.txt`
- [ ] Update `settings/base.py` DATABASES to use `dj_database_url.config(default=env('DATABASE_URL'))`
- [ ] Update `.env`: `DATABASE_URL=postgres://speechef:password@localhost:5432/speechef`
- [ ] Update `.env.example` with the DATABASE_URL placeholder
- [ ] Run `python manage.py migrate` against PostgreSQL
- [ ] Run `python manage.py createsuperuser` on the new DB
- [ ] Verify admin and all views work against PostgreSQL
- [ ] Remove `db.sqlite3` from version control (add to `.gitignore`)
