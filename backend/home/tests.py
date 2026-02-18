from django.test import TestCase
from django.urls import reverse


class HomeViewTest(TestCase):
    def test_home_index_returns_200(self):
        response = self.client.get(reverse('home_index'))
        self.assertEqual(response.status_code, 200)
