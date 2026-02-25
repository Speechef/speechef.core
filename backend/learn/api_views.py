from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Post, Category, Comment, UserBookmark, UserPostCompletion
from .serializers import PostListSerializer, PostDetailSerializer, CategorySerializer, CommentSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def posts(request):
    qs = Post.objects.all().order_by('-created_on')
    category = request.query_params.get('category')
    search = request.query_params.get('search', '').strip()
    bookmarked = request.query_params.get('bookmarked')
    if category:
        qs = qs.filter(categories__name__iexact=category)
    if search:
        from django.db.models import Q
        qs = qs.filter(Q(title__icontains=search) | Q(body__icontains=search))
    if bookmarked and request.user.is_authenticated:
        bookmarked_ids = UserBookmark.objects.filter(user=request.user).values_list('post_id', flat=True)
        qs = qs.filter(pk__in=bookmarked_ids)
    return Response(PostListSerializer(qs, many=True, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(PostDetailSerializer(post, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def categories(request):
    return Response(CategorySerializer(Category.objects.all(), many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_comment(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    body = request.data.get('body', '').strip()
    if not body:
        return Response({'detail': 'Comment body is required.'}, status=status.HTTP_400_BAD_REQUEST)

    comment = Comment.objects.create(
        post=post,
        author=request.user.username,
        body=body,
    )
    return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_complete(request, pk):
    """Toggle per-user completion for a post. Returns { completed: bool }."""
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    completion, created = UserPostCompletion.objects.get_or_create(user=request.user, post=post)
    if not created:
        completion.delete()
        return Response({'completed': False})
    return Response({'completed': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bookmark_toggle(request, pk):
    """Toggle bookmark for a post. Returns { bookmarked: bool }."""
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

    bookmark, created = UserBookmark.objects.get_or_create(user=request.user, post=post)
    if not created:
        bookmark.delete()
        return Response({'bookmarked': False})
    return Response({'bookmarked': True})
