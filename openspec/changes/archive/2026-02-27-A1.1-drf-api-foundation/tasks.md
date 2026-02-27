# A1.1 Tasks

- [x] Add `djangorestframework==3.14.0` and `djangorestframework-simplejwt==5.3.1` to `requirements.txt`
- [x] Add `rest_framework` and `rest_framework_simplejwt` to `INSTALLED_APPS` in `base.py`
- [x] Add `REST_FRAMEWORK` settings to `base.py` (JWT auth, IsAuthenticatedOrReadOnly, JSON renderer)
- [x] Add `SIMPLE_JWT` settings to `base.py` (60min access, 7d refresh, rotate)
- [x] Enable browsable API renderer in `development.py` only
- [x] Create `backend/speechef/api_urls.py` with `api_root` view and JWT token endpoints
- [x] Wire `path('api/v1/', include('speechef.api_urls'))` into root `urls.py`
- [x] `python manage.py check` — 0 issues
