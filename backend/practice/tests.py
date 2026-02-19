from django.test import TestCase
from django.urls import reverse


class PracticeViewTest(TestCase):
    def test_practice_index_returns_200(self):
        # Tests the game hub page (no DB queries needed)
        response = self.client.get(reverse('practice_index'))
        self.assertEqual(response.status_code, 200)

    def test_word_scramble_empty_queryset_returns_200(self):
        # word_scramble handles empty WordQuestion gracefully
        response = self.client.get(reverse('word_scramble'))
        self.assertEqual(response.status_code, 200)

    def test_guess_the_word_empty_queryset_returns_200(self):
        # guess_the_word must not 500 when WordQuestion table is empty
        response = self.client.get(reverse('guess_the_word'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'No questions are available yet')
