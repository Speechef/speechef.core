from django.shortcuts import render
from django.http import JsonResponse

def landing_page(request):
    return render(request, "landing_page.html")

def healthz(request):
    return JsonResponse({"status": "ok"})