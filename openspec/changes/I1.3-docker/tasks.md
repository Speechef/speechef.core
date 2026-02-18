# I1.3 Tasks

- [ ] Create `Dockerfile`:
      FROM python:3.12-slim
      WORKDIR /app
      COPY requirements.txt .
      RUN pip install --no-cache-dir -r requirements.txt
      COPY . .
      CMD ["gunicorn", "speechef.wsgi:application", "--bind", "0.0.0.0:8000"]
- [ ] `pip install gunicorn whitenoise`; update `requirements.txt`
- [ ] Add `whitenoise.middleware.WhiteNoiseMiddleware` to MIDDLEWARE (static files in prod)
- [ ] Create `docker-compose.yml` with services: db (postgres:16), redis (redis:7), web
- [ ] Create `.dockerignore` (.venv, .git, __pycache__, db.sqlite3)
- [ ] Test: `docker compose up --build` → visit localhost:8000
- [ ] Test: `docker compose run web python manage.py migrate`
- [ ] Test: static files served correctly via whitenoise
