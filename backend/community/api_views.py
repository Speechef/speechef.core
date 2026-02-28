from django.db.models import Count, Exists, OuterRef
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Thread, Reply, ThreadVote


def _thread_data(thread, user=None):
    vote_count  = thread.votes.count()
    reply_count = thread.replies.count()
    is_voted    = False
    if user and user.is_authenticated:
        is_voted = ThreadVote.objects.filter(user=user, thread=thread).exists()
    return {
        "id":          thread.id,
        "title":       thread.title,
        "body":        thread.body,
        "category":    thread.category,
        "is_pinned":   thread.is_pinned,
        "view_count":  thread.view_count,
        "vote_count":  vote_count,
        "reply_count": reply_count,
        "is_voted":    is_voted,
        "author":      thread.user.username,
        "created_at":  thread.created_at.isoformat(),
    }


def _reply_data(reply, user=None):
    return {
        "id":          reply.id,
        "body":        reply.body,
        "is_accepted": reply.is_accepted,
        "author":      reply.user.username,
        "created_at":  reply.created_at.isoformat(),
        "is_own":      user is not None and user.is_authenticated and reply.user == user,
    }


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def threads(request):
    if request.method == "GET":
        qs = Thread.objects.all()
        category = request.query_params.get("category")
        search   = request.query_params.get("search", "").strip()
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(title__icontains=search)
        qs = qs[:50]
        return Response([_thread_data(t, request.user) for t in qs])

    # POST
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
    title    = request.data.get("title", "").strip()
    body     = request.data.get("body", "").strip()
    category = request.data.get("category", "general")
    if not title or not body:
        return Response({"detail": "title and body are required."}, status=status.HTTP_400_BAD_REQUEST)
    thread = Thread.objects.create(user=request.user, title=title, body=body, category=category)
    return Response(_thread_data(thread, request.user), status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def thread_detail(request, pk):
    try:
        thread = Thread.objects.get(pk=pk)
    except Thread.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    thread.view_count += 1
    thread.save(update_fields=["view_count"])
    data = _thread_data(thread, request.user)
    data["replies"] = [_reply_data(r, request.user) for r in thread.replies.all()]
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_reply(request, pk):
    try:
        thread = Thread.objects.get(pk=pk)
    except Thread.DoesNotExist:
        return Response({"detail": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
    body = request.data.get("body", "").strip()
    if not body:
        return Response({"detail": "body is required."}, status=status.HTTP_400_BAD_REQUEST)
    reply = Reply.objects.create(user=request.user, thread=thread, body=body)
    return Response(_reply_data(reply, request.user), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def vote_thread(request, pk):
    try:
        thread = Thread.objects.get(pk=pk)
    except Thread.DoesNotExist:
        return Response({"detail": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
    vote, created = ThreadVote.objects.get_or_create(user=request.user, thread=thread)
    if not created:
        vote.delete()
        voted = False
    else:
        voted = True
    return Response({"voted": voted, "vote_count": thread.votes.count()})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_reply(request, pk):
    try:
        reply = Reply.objects.get(pk=pk)
    except Reply.DoesNotExist:
        return Response({"detail": "Reply not found."}, status=status.HTTP_404_NOT_FOUND)
    if reply.thread.user != request.user:
        return Response({"detail": "Only the thread author can accept an answer."}, status=status.HTTP_403_FORBIDDEN)
    # Clear previous accepted
    reply.thread.replies.filter(is_accepted=True).update(is_accepted=False)
    reply.is_accepted = True
    reply.save(update_fields=["is_accepted"])
    return Response({"accepted": True})
