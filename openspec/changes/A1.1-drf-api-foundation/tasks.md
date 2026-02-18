# A1.1 Tasks

- [ ] `pip install djangorestframework djangorestframework-simplejwt django-cors-headers`
- [ ] Update `requirements.txt`
- [ ] Add to `INSTALLED_APPS`: `'rest_framework'`, `'rest_framework_simplejwt'`, `'corsheaders'`
- [ ] Add `CorsMiddleware` to `MIDDLEWARE` (before `CommonMiddleware`)
- [ ] Add DRF settings to `settings.py`:
      REST_FRAMEWORK = {
          'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
          'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
      }
- [ ] Create `speechef/api_urls.py` with the API root router
- [ ] Include in `speechef/urls.py`: `path('api/v1/', include('speechef.api_urls'))`
- [ ] Add JWT token endpoints to `api_urls.py`
- [ ] Verify `/api/v1/` returns 200 and `/api/v1/token/` accepts credentials
