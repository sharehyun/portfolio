from django.shortcuts import render, redirect, get_object_or_404
from .models import ReadingGroup, Member # bookclub 앱의 모델 임포트
from django.contrib import messages # 메시지 프레임워크 사용
from django.db.models import Q # 쿼리 사용

# chatroomIntro.html을 위한 뷰 (첫 번째 그룹을 표시)
def chatroom_detail(request):
    try:
        # 데이터베이스에서 첫 번째 ReadingGroup 객체를 가져옵니다.
        # 비공개/공개 그룹 중 하나를 선택하거나, 특정 ID를 지정할 수 있습니다.
        # 여기서는 일단 ID 1번 그룹(이전에 생성했다면)을 가져오거나 첫 번째 그룹을 가져옵니다.
        group = ReadingGroup.objects.first() # 또는 ReadingGroup.objects.get(id=1)
    except ReadingGroup.DoesNotExist:
        group = None

    current_members_count = group.member.count() if group else 0

    context = {
        'group': group,
        'current_members_count': current_members_count,
    }
    return render(request, 'chatroomIntro.html', context)

# 그룹 참여 로직 뷰
def join_group(request, group_id):
    # 실제 사용 시에는 로그인한 멤버의 ID를 세션 등에서 가져와야 합니다.
    # 여기서는 임시 Member를 사용하므로, 샘플 데이터를 기반으로 가져옵니다.
    member_id_from_session = "sampleuser" # 로그인된 사용자 ID 가정 (실제로는 세션에서 가져옴)
    try:
        member = Member.objects.get(id=member_id_from_session)
    except Member.DoesNotExist:
        messages.error(request, '로그인이 필요합니다.') # 또는 로그인 페이지로 리다이렉트
        return redirect('bookclub:chatroom_detail') # 다시 상세 페이지로

    group = get_object_or_404(ReadingGroup, id=group_id)

    # 이미 참여 중인지 확인
    if group.member.filter(id=member.id).exists():
        messages.info(request, '이미 참여 중인 그룹입니다.')
        return redirect('bookclub:chatroom_detail')

    # 인원 제한 확인
    if group.member.count() >= group.max_member:
        messages.warning(request, '이 그룹은 이미 최대 인원에 도달했습니다.')
        return redirect('bookclub:chatroom_detail')

    # 비공개 그룹 비밀번호 확인
    if group.is_public == "1": # 비공개 그룹인 경우
        if request.method == 'POST':
            entered_password = request.POST.get('password_input')
            if entered_password and int(entered_password) == group.password:
                # 비밀번호 일치, 그룹에 멤버 추가
                group.member.add(member)
                messages.success(request, f'"{group.group_name}" 그룹에 성공적으로 가입되었습니다!')
                return redirect('bookclub:chatroom_detail') # 가입 후 상세 페이지로 이동
            else:
                messages.error(request, '비밀번호가 일치하지 않습니다.')
                return redirect('bookclub:chatroom_detail') # 비밀번호 불일치 시 다시 상세 페이지로
        else:
            # POST 요청이 아닌 경우 (예: 직접 URL 접근), 메시지 표시 후 리다이렉트
            messages.warning(request, '비밀번호 확인을 위한 유효한 요청이 아닙니다.')
            return redirect('bookclub:chatroom_detail')
    else: # 공개 그룹인 경우
        # 공개 그룹은 비밀번호 확인 없이 바로 멤버 추가
        group.member.add(member)
        messages.success(request, f'"{group.group_name}" 그룹에 성공적으로 가입되었습니다!')
        return redirect('bookclub:chatroom_detail')

# 기타 뷰는 이 아래에 추가
# def Share_Main(request): ...
# def Share_AddGroup(request): ...
# def ajax_search(request): ...