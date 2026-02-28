from django.db import models

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

class WordScramble(models.Model):
    word = models.CharField(max_length=100)
    scrambled_word = models.CharField(max_length=100)

    def __str__(self):
        return self.word

class GameSession(models.Model):
    GAME_CHOICES = [
        ('guess', 'Guess the Word'),
        ('memory', 'Memory Match'),
        ('scramble', 'Word Scramble'),
    ]
    user = models.ForeignKey(
        'auth.User', on_delete=models.CASCADE, related_name='game_sessions'
    )
    game = models.CharField(max_length=20, choices=GAME_CHOICES)
    score = models.IntegerField(default=0)
    played_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-played_at']

    def __str__(self):
        return f'{self.user.username} — {self.game} — {self.score}'


#TODO
class MemoryMatch(models.Model):
    image = models.ImageField(upload_to='memory_match_images/')
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.description


class VocabWord(models.Model):
    DIFFICULTY_CHOICES = [
        ("basic", "Basic"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]
    word = models.CharField(max_length=100, unique=True)
    definition = models.TextField()
    example = models.TextField(blank=True)
    exam_tags = models.JSONField(default=list)  # e.g. ["ielts", "toefl"]
    difficulty = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.word


class UserVocabProgress(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='vocab_progress')
    word = models.ForeignKey(VocabWord, on_delete=models.CASCADE, related_name='user_progress')
    known = models.BooleanField(default=False)
    reviewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "word"]

    def __str__(self):
        return f"{self.user.username} — {self.word.word} — {'known' if self.known else 'learning'}"


class SavedWord(models.Model):
    user       = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='saved_words')
    word       = models.CharField(max_length=150)
    definition = models.TextField(blank=True)
    note       = models.CharField(max_length=300, blank=True)
    saved_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-saved_at']
        unique_together = ['user', 'word']

    def __str__(self):
        return f'{self.user.username} — {self.word}'