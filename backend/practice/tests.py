from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth.models import User
from .models import WordQuestion, GameSession
from practice.utils import update_streak
from datetime import date, timedelta

_CACHE_OVERRIDE = override_settings(
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)


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

    def test_leaderboard_returns_200(self):
        response = self.client.get(reverse('leaderboard'))
        self.assertEqual(response.status_code, 200)

    def test_leaderboard_game_filter_returns_200(self):
        response = self.client.get(reverse('leaderboard') + '?game=guess')
        self.assertEqual(response.status_code, 200)


@_CACHE_OVERRIDE
class StreakTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='streaker', password='pass')

    def test_first_play_sets_streak_to_1(self):
        update_streak(self.user)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.current_streak, 1)

    def test_same_day_play_does_not_increment(self):
        update_streak(self.user)
        update_streak(self.user)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.current_streak, 1)

    def test_consecutive_day_increments_streak(self):
        profile = self.user.profile
        profile.last_played_date = date.today() - timedelta(days=1)
        profile.current_streak = 3
        profile.save()
        update_streak(self.user)
        profile.refresh_from_db()
        self.assertEqual(profile.current_streak, 4)

    def test_missed_day_resets_streak(self):
        profile = self.user.profile
        profile.last_played_date = date.today() - timedelta(days=2)
        profile.current_streak = 5
        profile.save()
        update_streak(self.user)
        profile.refresh_from_db()
        self.assertEqual(profile.current_streak, 1)

    def test_longest_streak_preserved(self):
        profile = self.user.profile
        profile.last_played_date = date.today() - timedelta(days=1)
        profile.current_streak = 10
        profile.longest_streak = 10
        profile.save()
        update_streak(self.user)
        profile.refresh_from_db()
        self.assertEqual(profile.longest_streak, 11)
