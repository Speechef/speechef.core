# B1.3 Tasks

- [ ] Add to `speechef/settings.py`:
      MEDIA_ROOT = BASE_DIR / 'media'
      MEDIA_URL = '/media/'
- [ ] Add to `speechef/urls.py` (dev only):
      from django.conf import settings
      from django.conf.urls.static import static
      urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
- [ ] Place a `default.jpg` in `media/` directory
- [ ] Uncomment image resize code in `users/models.py`
- [ ] Uncomment `<img>` tag in `users/templates/users/profile.html`
- [ ] Test: register user → upload image → see image on profile page
