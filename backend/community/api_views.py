from django.db.models import Count, Exists, OuterRef, F
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Thread, Reply, ThreadVote


def _thread_qs(user=None):
    """Return a queryset with counts pre-annotated to avoid N+1 queries."""
    qs = Thread.objects.select_related('user').annotate(
        vote_count_ann=Count('votes', distinct=True),
        reply_count_ann=Count('replies', distinct=True),
    )
    if user and user.is_authenticated:
        qs = qs.annotate(
            is_voted_ann=Exists(ThreadVote.objects.filter(user=user, thread=OuterRef('pk')))
        )
    return qs


def _thread_data(thread, user=None):
    # Use pre-annotated values when available (avoids N+1); fall back for
    # freshly-created objects that haven't been fetched through _thread_qs().
    vote_count  = getattr(thread, 'vote_count_ann',  None)
    if vote_count is None:
        vote_count = thread.votes.count()
    reply_count = getattr(thread, 'reply_count_ann', None)
    if reply_count is None:
        reply_count = thread.replies.count()
    is_voted = False
    if user and user.is_authenticated:
        is_voted_ann = getattr(thread, 'is_voted_ann', None)
        is_voted = is_voted_ann if is_voted_ann is not None else \
            ThreadVote.objects.filter(user=user, thread=thread).exists()
    is_own_thread = False
    if user and user.is_authenticated:
        is_own_thread = thread.user == user
    return {
        "id":            thread.id,
        "title":         thread.title,
        "body":          thread.body,
        "category":      thread.category,
        "is_pinned":     thread.is_pinned,
        "view_count":    thread.view_count,
        "vote_count":    vote_count,
        "reply_count":   reply_count,
        "is_voted":      is_voted,
        "is_own_thread": is_own_thread,
        "author":        thread.user.username,
        "created_at":    thread.created_at.isoformat(),
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
        qs = _thread_qs(request.user)
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
        thread = _thread_qs(request.user).get(pk=pk)
    except Thread.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    Thread.objects.filter(pk=pk).update(view_count=F('view_count') + 1)
    thread.refresh_from_db(fields=['view_count'])
    data = _thread_data(thread, request.user)
    # select_related('user') avoids 1 extra query per reply (N+1 fix)
    data["replies"] = [_reply_data(r, request.user) for r in thread.replies.select_related('user').all()]
    return Response(data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_thread(request, pk):
    try:
        thread = Thread.objects.get(pk=pk)
    except Thread.DoesNotExist:
        return Response({"detail": "Thread not found."}, status=status.HTTP_404_NOT_FOUND)
    if thread.user != request.user:
        return Response({"detail": "Only the thread author can delete this thread."}, status=status.HTTP_403_FORBIDDEN)
    thread.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


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
