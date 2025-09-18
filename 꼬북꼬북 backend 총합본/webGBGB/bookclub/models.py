from django.db import models

# --- 임시 Book 모델 (나중에 booksearch 앱으로 대체될 것입니다) ---
class Book(models.Model):
    book_id = models.AutoField(primary_key=True)
    cover = models.URLField(max_length=1500, blank=True, null=True) # cover를 blank/null 허용
    book_url = models.URLField(max_length=1500, blank=True, null=True) # book_url를 blank/null 허용
    title = models.CharField(max_length=1000)
    author = models.CharField(max_length=1000)
    publisher = models.CharField(max_length=500, blank=True, null=True) # publisher를 blank/null 허용
    pub_date = models.CharField(max_length=500, blank=True, null=True) # pub_date를 blank/null 허용
    ISBN = models.CharField(max_length=500, unique=True) # ISBN은 고유해야 함
    page = models.CharField(max_length=500, blank=True, null=True) # page를 blank/null 허용
    size = models.CharField(max_length=500, blank=True, null=True)
    review_count = models.IntegerField(default=0)
    bookmark_count = models.IntegerField(default=0)
    rating = models.IntegerField(default=0)
    views = models.IntegerField(default=0)

    @property
    def average(self):
        return self.rating / self.review_count if self.review_count > 0 else 0

    def __str__(self):
        return f"{self.book_id}, {self.title}, {self.author}"

# --- 임시 Member 모델 (나중에 member 앱으로 대체될 것입니다) ---
class Member(models.Model):
    member_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    id = models.CharField(max_length=50, unique=True) # id는 고유해야 함
    pw = models.CharField(max_length=20)
    email = models.CharField(max_length=50, unique=True) # email은 고유해야 함
    gender = models.CharField(max_length=20,blank=True, null=True)
    birth = models.CharField(max_length=100,blank=True, null=True)
    genres = models.CharField(max_length=100,blank=True, null=True)

    mdate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.member_id}, {self.id}, {self.name}'

# --- ReadingGroup 모델 (위의 임시 모델들을 참조합니다) ---
class ReadingGroup(models.Model):
    group_name = models.CharField(max_length=100)
    max_member = models.IntegerField(default=10)
    admin = models.ForeignKey(Member, on_delete=models.CASCADE,related_name='admin_reading_groups')
    member = models.ManyToManyField(Member,related_name='member_reading_groups',blank=True)
    description = models.TextField(blank=True)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    tag = models.CharField(max_length=50, blank=True, null=True)
    is_public = models.CharField(max_length=1, choices=[("0", "공개"), ("1", "비공개")], default="0") # '0':공개, '1':비공개
    password = models.IntegerField(blank=True, null=True)  # 그룹 비밀번호 (INT 타입으로 변경)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def tags_list(self):
        if self.tag:
            return [t for t in self.tag.split("#") if t]
        return []

    def __str__(self):
        return f'{self.group_name}'