from django.test import TestCase
from django.urls import reverse


class JobsViewTest(TestCase):
    def test_jobs_index_returns_200(self):
        response = self.client.get(reverse('jobs_index'))
        self.assertEqual(response.status_code, 200)
