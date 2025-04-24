from django.db import models

# Create your models here.

class Practice(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class WordQuestion(models.Model):
    word = models.CharField(max_length=100)
    correct_meaning = models.CharField(max_length=255)
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)

    def get_options(self):
        return [self.option_a, self.option_b, self.option_c, self.option_d]

    def __str__(self):
        return self.word

