
from django.urls import path,include
from . import views

app_name = 'member'

urlpatterns = [
    path('join1/',views.join1,name='join1'),
    path('join2/',views.join2,name='join2'),
    path('check-id/', views.check_id, name='check_id'),  # 아이디 중복체크
    path('signup/', views.signup_process, name='signup_process'),  # 회원가입 처리 (기존 유지)
    path('join3/',views.signup_process,name='signup_process'),  
    path('join-complete/',views.join3,name='join_complete'),
    path('login/',views.login,name='login'),
    path('logout/',views.logout,name='logout'),
    
    
    
    # 아이디 찾기
    path('send-verification/', views.send_verification_code, name='send_verification'),
    path('verify-code/', views.verify_code_and_find_id, name='verify_code'),
    path('find1/',views.find1,name='find1'),
    
    # 비밀번호 찾기
    path('send-password-reset-code/', views.send_password_reset_code, name='send_password_reset_code'),
    path('verify-password-reset-code/', views.verify_code_and_reset_password, name='verify_password_reset_code'),
    path('find2/',views.find2,name='find2'),
    
    # 회원 정보 수정
    path('update/<str:user_id>/', views.member_update, name='member_update'),
    path('update_process/', views.member_update_process, name='member_update_process'),
    
    path('kakao/login/', views.kakao_login, name='kakao_login'), # 이 부분이 중요!
    path('kakao/callback/', views.kakao_callback, name='kakao_callback'),
    
    path('clear-kakao-session/', views.clear_kakao_session, name='clear_kakao_session'),
    
    # join2 이메일 인증 추가
    path('send-join2-verification/', views.send_join2_verification_code, name='send_join2_verification'),
    path('verify-join2-code/', views.verify_join2_code, name='verify_join2_code'),
    
]