from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Post, Category, Comment
from .serializers import PostListSerializer, PostDetailSerializer, CategorySerializer, CommentSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def posts(request):
    qs = Post.objects.all().order_by('-created_on')
    category = request.query_params.get('category')
    if category:
        qs = qs.filter(categories__name__iexact=category)
    return Response(PostListSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(PostDetailSerializer(post).data)


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
