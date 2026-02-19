from django.contrib import admin
from .models import Practice, WordQuestion, WordScramble, MemoryMatch, GameSession

admin.site.register(Practice)
admin.site.register(WordQuestion)
admin.site.register(WordScramble)
admin.site.register(MemoryMatch)
admin.site.register(GameSession)
