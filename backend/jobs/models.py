from django.db import models

# Create your models here.

class Jobs(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    company = models.CharField(max_length=100, blank=True)
    # logo = models.ImageField(upload_to='images/')
    job_type = models.CharField(max_length=100 , blank=True)
    job_rate = models.IntegerField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
    url = models.URLField(blank=True)
    

    def __str__(self):
        return self.title
