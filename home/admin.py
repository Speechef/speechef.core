from django.contrib import admin
from home.models import Category, Comment, Post

class CategoryAdmin(admin.ModelAdmin):
    pass

class PostAdmin(admin.ModelAdmin):
    pass

class CommentAdmin(admin.ModelAdmin):
    pass

admin.site.register(Category, CategoryAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)


admin.site.site_header = "Speechef Admin"
admin.site.site_title = "Speechef Admin Portal"
admin.site.index_title = "Welcome to Speechef"