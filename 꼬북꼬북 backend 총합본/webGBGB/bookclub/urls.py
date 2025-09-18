from django.urls import path
from . import views

app_name = 'bookclub' # 앱 이름을 정의합니다.
urlpatterns = [
    path('chatroomintro/', views.chatroom_detail, name='chatroom_detail'), # 채팅방 상세 페이지
    path('joingroup/<int:group_id>/', views.join_group, name='join_group'), # 그룹 참여 로직
]