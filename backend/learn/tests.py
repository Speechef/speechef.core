from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Post, Comment

_SESSION_OVERRIDE = override_settings(
    SESSION_ENGINE='django.contrib.sessions.backends.db',
    CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}},
)


class LearnViewTest(TestCase):
    def test_learn_index_returns_200(self):
        response = self.client.get(reverse('learn_index'))
        self.assertEqual(response.status_code, 200)

    def test_learn_category_returns_200(self):
        response = self.client.get(reverse('learn_category', args=['general']))
        self.assertEqual(response.status_code, 200)


@_SESSION_OVERRIDE
class CommentTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='commenter', password='pass')
        self.post = Post.objects.create(title='Test Post', body='Body text')

    def test_authenticated_user_can_post_comment(self):
        self.client.login(username='commenter', password='pass')
        response = self.client.post(
            reverse('learn_detail', args=[self.post.pk]),
            {'body': 'Great post!'},
        )
        self.assertRedirects(response, reverse('learn_detail', args=[self.post.pk]))
        self.assertEqual(Comment.objects.filter(post=self.post).count(), 1)
        self.assertEqual(Comment.objects.first().author, 'commenter')

    def test_unauthenticated_post_redirects_to_login(self):
        response = self.client.post(
            reverse('learn_detail', args=[self.post.pk]),
            {'body': 'Should not be saved'},
        )
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login', response['Location'])
        self.assertEqual(Comment.objects.count(), 0)

    def test_empty_comment_not_saved(self):
        self.client.login(username='commenter', password='pass')
        response = self.client.post(
            reverse('learn_detail', args=[self.post.pk]),
            {'body': ''},
        )
        self.assertEqual(response.status_code, 200)  # Re-renders form with error
        self.assertEqual(Comment.objects.count(), 0)
