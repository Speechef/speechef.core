from django.shortcuts import render
from django.http import HttpResponse
from .models import Jobs

def jobs_index(request):
    jobs = Jobs.objects.all()
    return render(request, "jobs/jobs.html", {"jobs": jobs})
