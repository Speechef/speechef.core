from rest_framework import serializers
from .models import Category, Post, Comment, UserBookmark, UserPostCompletion


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'author', 'body', 'created_on']


class PostListSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    is_bookmarked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'created_on', 'categories', 'completed', 'is_bookmarked', 'is_completed']

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserBookmark.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserPostCompletion.objects.filter(user=request.user, post=obj).exists()
        return False


class PostDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True, source='comment_set')
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'body', 'created_on', 'categories', 'completed', 'is_completed', 'comments']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserPostCompletion.objects.filter(user=request.user, post=obj).exists()
        return False
