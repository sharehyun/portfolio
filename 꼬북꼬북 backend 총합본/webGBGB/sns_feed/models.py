from django.db import models
from django.conf import settings
from member.models import Member
from shareMain.models import ReadingGroup # ReadingGroup 모델 임포트

class Post(models.Model):

    member_id = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='posts')
    # group 필드를 GroupChatRoom에서 ReadingGroup으로 변경
    group_id = models.ForeignKey(ReadingGroup, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='posts_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # group이 ReadingGroup 인스턴스이므로 group_name 속성 사용

        return f"Post by {self.member_id.name} in {self.group_id.group_name}"

class Comment(models.Model):
    post_id = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    member_id = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on Post {self.post.id}"

class PostLike(models.Model):
    """
    사용자가 게시글에 '좋아요'를 누른 것을 기록하는 모델.
    한 사용자가 한 게시글에 중복으로 좋아요를 누를 수 없도록 unique_together 제약을 설정합니다.
    """
    post_id = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='postlike')
    member_id = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='postlike')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('member_id', 'post_id') # 한 사용자가 한 게시글에 한 번만 좋아요를 누를 수 있도록

class PostImage(models.Model):
    post_id = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='post_images/', null=True, blank=True)

    def __str__(self):
        return f"{self.post_id}, {self.image}"