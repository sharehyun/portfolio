from django.urls import path
from . import views

urlpatterns = [

    path('detail/<int:group_id>/', views.chatroom_detail, name='chatroom-detail'),

]