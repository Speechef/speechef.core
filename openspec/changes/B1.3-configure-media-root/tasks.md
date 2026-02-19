# B1.3 Tasks

- [x] Add to `speechef/settings.py`:
      MEDIA_ROOT = BASE_DIR / 'media'
      MEDIA_URL = '/media/'
- [x] Add to `speechef/urls.py` (dev only):
      from django.conf import settings
      from django.conf.urls.static import static
      urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
- [x] Place a `default.jpg` in `media/` directory
- [x] Uncomment image resize code in `users/models.py`
- [x] Uncomment `<img>` tag in `users/templates/users/profile.html`
- [x] Test: register user → upload image → see image on profile page
