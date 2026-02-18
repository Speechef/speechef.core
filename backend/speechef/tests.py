from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User


class APIRootTest(TestCase):
    def test_api_root_returns_200(self):
        response = self.client.get('/api/v1/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/json')

    def test_api_token_endpoint_exists(self):
        # POST with no credentials → 400, not 404/500
        response = self.client.post(
            '/api/v1/token/',
            {'username': 'nobody', 'password': 'wrong'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 401)

    def test_api_token_with_valid_user(self):
        User.objects.create_user(username='apiuser', password='Str0ng!Pass')
        response = self.client.post(
            '/api/v1/token/',
            {'username': 'apiuser', 'password': 'Str0ng!Pass'},
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('access', data)
        self.assertIn('refresh', data)

    def test_landing_page_returns_200(self):
        response = self.client.get(reverse('landing_page'))
        self.assertEqual(response.status_code, 200)
