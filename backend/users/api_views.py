from django.contrib.auth.models import User
from rest_framework import generics, permissions
from .serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'put', 'patch']

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        if self.request.method in ('PUT', 'PATCH'):
            return self.request.user.profile
        return self.request.user
