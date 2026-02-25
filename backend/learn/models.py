from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=30)
    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name    

class Post(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    categories = models.ManyToManyField("Category", related_name="posts")
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title        
    
class Comment(models.Model):
    author = models.CharField(max_length=60)
    body = models.TextField()
    created_on = models.DateTimeField(auto_now_add=True)
    post = models.ForeignKey("Post", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.author} on '{self.post}'"


class UserBookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learn_bookmarks')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']

    def __str__(self):
        return f"{self.user.username} → {self.post.title}"


class UserPostCompletion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learn_completions')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']

    def __str__(self):
        return f"{self.user.username} completed '{self.post.title}'"