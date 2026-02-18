from django.test import TestCase
from django.urls import reverse


class LearnViewTest(TestCase):
    def test_learn_index_returns_200(self):
        response = self.client.get(reverse('learn_index'))
        self.assertEqual(response.status_code, 200)

    def test_learn_category_returns_200(self):
        response = self.client.get(reverse('learn_category', args=['general']))
        self.assertEqual(response.status_code, 200)
