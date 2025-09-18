from django.shortcuts import render, redirect, get_object_or_404
from .models import ReadingGroup, Member # bookclub 앱의 모델 임포트
from django.contrib import messages # 메시지 프레임워크 사용
from django.db.models import Q # 쿼리 사용
from django.conf import settings # MEDIA_URL, MEDIA_ROOT 사용을 위해

def chatroom_detail(request, group_id):
    member_id = request.session.get('member_id')
    if not member_id:
        messages.warning(request, '로그인이 필요합니다.')
        return redirect('member:login')  # 로그인 페이지로
    try:
        member = Member.objects.get(member_id=member_id)
    except Member.DoesNotExist:
        return redirect('member:login')  # 세션에 이상 있으면 로그인 요구

    group = get_object_or_404(ReadingGroup, id=group_id)
    tag_list = group.tag.split(",") if group.tag else []
    current_members_count = group.member.all().count()

    # 가입 요청인 경우 (POST only)
    if request.method == 'POST':
        entered_password=request.POST.get("password_input","")

        print("entered_password : ", entered_password)
        print("group.password : ", group.password)

        if group.member.filter(id=member.id).exists():
            return redirect(f'/feedpage/sns_feed/{group.id}/')


        if current_members_count >= group.max_member:
            messages.warning(request, '이 그룹은 이미 최대 인원에 도달했습니다.')
            return redirect(f'/chatrooms/detail/{group.id}/')


        # 비공개 그룹이면 비밀번호 확인
        if not group.is_public=="0":
            entered_password = request.POST.get('password_input')
            if not entered_password or entered_password != group.password:
                messages.error(request, '비밀번호가 일치하지 않습니다.')
                return redirect(f'/chatrooms/detail/{group.id}/')


        # 가입 처리
        group.member.add(member)
        messages.success(request, f'"{group.group_name} 그룹에 성공적으로 가입되었습니다!')
        return redirect(f'/feedpage/sns_feed/{group.id}/')
    
    # GET 요청 시 상세 보기
    context = {
        'group': group,
        'tag_list': tag_list,
        'current_members_count': current_members_count,
    }
    return render(request, 'chatroom_detail.html', context)

