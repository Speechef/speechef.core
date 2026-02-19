# A1.2 Tasks

- [x] Create `users/serializers.py` with `UserSerializer` and `ProfileSerializer`
- [x] Create `users/api_views.py` with:
      - `RegisterView` (CreateAPIView, permission=AllowAny)
      - `ProfileView` (RetrieveUpdateAPIView, permission=IsAuthenticated)
- [x] Register routes in `speechef/api_urls.py`:
      path('auth/register/', RegisterView.as_view())
      path('auth/profile/', ProfileView.as_view())
- [x] Test registration, token retrieval, and profile update via curl or DRF browser
