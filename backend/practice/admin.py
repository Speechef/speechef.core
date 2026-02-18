from django.contrib import admin

# Register your models here.
from .models import Practice, WordQuestion
admin.site.register(Practice)
admin.site.register(WordQuestion)
