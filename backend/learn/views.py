from django.shortcuts import render, redirect
from django.http import HttpResponse
from learn.models import Post, Comment, Category
from .forms import CommentForm


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
    all_categories = Category.objects.all()  # Retrieve all categories

    context = {
        "posts": posts,
        "all_categories": all_categories
    }
    return render(request, "learn/index.html", context)

def learn_category(request, category):
    posts = Post.objects.filter(
        categories__name__contains=category
    ).order_by("-created_on")
    all_categories = Category.objects.all()  # Retrieve all categories
    context = {
        "category": category,
        "posts": posts,
        "all_categories": all_categories
    }
    return render(request, "learn/category.html", context)

def learn_detail(request, pk):
    post = Post.objects.get(pk=pk)
    comments = Comment.objects.filter(post=post).order_by('created_on')

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return redirect('login')
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.author = request.user.username
            comment.post = post
            comment.save()
            return redirect('learn_detail', pk=pk)
    else:
        form = CommentForm()

    context = {
        "post": post,
        "comments": comments,
        "form": form,
    }
    return render(request, "learn/detail.html", context)