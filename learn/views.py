from django.shortcuts import render
from django.http import HttpResponse
from learn.models import Post, Comment


def index(request):
    return HttpResponse("You're at learn Page")


def learn_index(request):
    """
    Render the 'learn/index.html' template with a context containing all posts ordered by creation date.
    
    Args:
        request: The HTTP request object.
        
    Returns:
        The rendered HTTP response.
    """
    posts = Post.objects.all().order_by("-created_on")
    context = {
        "posts": posts,
    }
    return render(request, "learn/index.html", context)

def learn_category(request, category):
    posts = Post.objects.filter(
        categories__name__contains=category
    ).order_by("-created_on")
    context = {
        "category": category,
        "posts": posts,
    }
    return render(request, "learn/category.html", context)

def learn_detail(request, pk):
    post = Post.objects.get(pk=pk)
    comments = Comment.objects.filter(post=post)
    context = {
        "post": post,
        "comments": comments,
    }

    return render(request, "learn/detail.html", context)