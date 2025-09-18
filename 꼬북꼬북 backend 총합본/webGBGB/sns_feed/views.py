from django.shortcuts import render, redirect
from shareMain.models import ReadingGroup
from django.contrib import messages
from member.models import Member
from sns_feed.models import Post, Comment, PostImage, PostLike
from django.http import JsonResponse
import json
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.utils import timezone # Import timezone

def sns_feed(request, chat_id):
    print("넘어온 chat_id : ", chat_id)
    reading_group = ReadingGroup.objects.get(id=chat_id)
    member_id = request.session.get('user_id')
    post = Post.objects.filter(group_id=reading_group.id).order_by('-created_at')
    for p in post:
        p.comment_list = Comment.objects.filter(post_id=p).order_by('created_at')
        
    likes = set()
    if member_id:
        try:
            member = Member.objects.get(id=member_id)
            from sns_feed.models import PostLike
            likes = set(
                PostLike.objects.filter(member_id=member)
                .values_list('post_id', flat=True)
            )
        except Member.DoesNotExist:
            member = None
            
    print("likes : ", likes)
        
    tag_list = reading_group.tags_list
    context = {
        'readinggroup': reading_group,
        'tag_list': tag_list,
        'post': post,
        'likes': likes,
    }
    return render(request, 'chatroom_sns.html', context)


@csrf_protect
@require_POST
def create(request):
    print("create 함수 들어옴")
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'status': 'error', 'message': '로그인이 필요합니다.'}, status=401)
    
    # @require_POST 데코레이터가 POST 요청만 허용하므로, if request.method == 'POST': 조건문은 불필요합니다.
    try:
        member = Member.objects.get(id=user_id)
        readinggroup_id = request.POST.get('readinggroup_id')
        content = request.POST.get('post-input', '').strip()
        image_file = request.FILES.get('post_file')

        if not content and not image_file:
            return JsonResponse({'status': 'error', 'message': '내용 또는 이미지를 입력해주세요.'}, status=400)

        reading_group = ReadingGroup.objects.get(id=readinggroup_id)
        
        post = Post.objects.create(
            member_id=member,
            group_id=reading_group,
            content=content,
        )
        
        # 이미지가 있다면 PostImage 모델에 저장
        if image_file:
            PostImage.objects.create(post_id=post, image=image_file)
        
        return JsonResponse({'status': 'success', 'message': '게시물이 성공적으로 작성되었습니다.'})
    except Member.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '회원 정보가 없습니다.'}, status=401)
    except ReadingGroup.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '독서모임을 찾을 수 없습니다.'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_protect
@require_POST
def post_like(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'error': '로그인이 필요합니다.'}, status=401)

    try:
        data = json.loads(request.body)
        post_id = data.get('post_id')
        member = Member.objects.get(id=user_id)
        post = Post.objects.get(id=post_id)

        # 이미 좋아요를 눌렀는지 확인
        like, created = PostLike.objects.get_or_create(member_id=member, post_id=post)

        if not created: # 이미 좋아요가 존재하면 취소 (삭제)
            like.delete()
            liked = False
        else: # 새로 좋아요를 누르면 (생성)
            liked = True
        
        # 업데이트된 좋아요 수 반환
        like_count = PostLike.objects.filter(post_id=post).count()

        return JsonResponse({'liked': liked, 'like_count': like_count})

    except Member.DoesNotExist:
        return JsonResponse({'error': '유효하지 않은 사용자입니다.'}, status=400)
    except Post.DoesNotExist:
        return JsonResponse({'error': '게시물을 찾을 수 없습니다.'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'error': '잘못된 JSON 형식입니다.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_protect
@require_POST
def post_edit(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'status': 'error', 'message': '로그인이 필요합니다.'}, status=401)
    
    try:
        data = json.loads(request.body)
        post_id = data.get('post_id')
        content = data.get('content', '').strip()
        if not content:
            return JsonResponse({'status': 'error', 'message': '내용을 입력해주세요.'}, status=400)
        
        post = Post.objects.get(id=post_id, member_id_id=user_id)
        post.content = content
        post.save()
        
        return JsonResponse({'status': 'success', 'message': '게시글이 수정되었습니다.', 'content': content})
    except Post.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '게시글이 없거나 수정 권한이 없습니다.'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': '잘못된 JSON 형식입니다.'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_protect
@require_POST
def post_delete(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'status': 'error', 'message': '로그인이 필요합니다.'}, status=401)
    
    try:
        data = json.loads(request.body)
        post_id = data.get('post_id')
        # 요청한 사용자가 작성한 게시글이 맞는지 확인 후 삭제
        post = Post.objects.get(id=post_id, member_id_id=user_id)
        post.delete()
        return JsonResponse({'status': 'success', 'message': '게시글이 삭제되었습니다.'})
    except Post.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '게시글이 없거나 삭제 권한이 없습니다.'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': '잘못된 JSON 형식입니다.'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
@csrf_protect
@require_POST
def reply_create(request):
    print("reply_create 함수 들어옴")
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'status': 'error', 'message': '로그인이 필요합니다.'}, status=401)
    
    # @require_POST 데코레이터가 POST 요청만 허용하므로, if request.method == 'POST': 조건문은 불필요합니다.
    try:
        member = Member.objects.get(id=user_id)
        # JSON 요청 바디를 파싱합니다.
        data = json.loads(request.body)
        content = data.get('content', "").strip()
        post_id = data.get('post_id', "")
        parent_comment_id = data.get('parent_comment_id') # 대댓글인 경우 부모 댓글 ID

        if not content:
            return JsonResponse({'status': 'error', 'message': '댓글 내용을 입력해주세요.'}, status=400)

        post = Post.objects.get(id=post_id)
        parent_comment = None
        if parent_comment_id:
            parent_comment = Comment.objects.get(id=parent_comment_id)
        
        comment = Comment.objects.create(
            post_id=post,
            member_id=member,
            content=content,
            parent_comment=parent_comment
        )
        
        # 클라이언트에게 반환할 댓글 정보 (member_name, created_at 포함)
        comment_data = {
            'id': comment.id,
            'content': comment.content,
            'member_name': comment.member_id.name,
            'created_at': timezone.localtime(comment.created_at).strftime("%Y.%m.%d %H:%M"), # 시간 형식 지정
            'parent_comment_id': comment.parent_comment.id if comment.parent_comment else None
        }
        
        return JsonResponse({'status': 'success', 'message': '댓글이 성공적으로 작성되었습니다.', 'comment': comment_data})
    except Member.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '회원 정보가 없습니다.'}, status=401)
    except Post.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '게시물을 찾을 수 없습니다.'}, status=404)
    except Comment.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '부모 댓글을 찾을 수 없습니다.'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': '잘못된 JSON 형식입니다.'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_protect
@require_POST
def reply_delete(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'status': 'error', 'message': '로그인이 필요합니다.'}, status=401)
    
    try:
        data = json.loads(request.body)
        comment_id = data.get('comment_id')
        # 요청한 사용자가 작성한 댓글이 맞는지 확인 후 삭제
        comment = Comment.objects.get(id=comment_id, member_id_id=user_id)
        comment.delete()
        return JsonResponse({'status': 'success', 'message': '댓글이 삭제되었습니다.'})
    except Comment.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '댓글이 없거나 삭제 권한이 없습니다.'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': '잘못된 JSON 형식입니다.'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_protect
@require_POST
def reply_edit(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JsonResponse({'status': 'error', 'message': '로그인이 필요합니다.'}, status=401)
    try:
        data = json.loads(request.body)
        comment_id = data.get('comment_id')
        content = data.get('content', '').strip()
        if not content:
            return JsonResponse({'status': 'error', 'message': '내용을 입력해주세요.'}, status=400)
        # 요청한 사용자가 작성한 댓글이 맞는지 확인 후 수정
        comment = Comment.objects.get(id=comment_id, member_id_id=user_id)
        comment.content = content
        comment.save()
        return JsonResponse({'status': 'success', 'message': '댓글이 수정되었습니다.', 'content': content})
    except Comment.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': '댓글이 없거나 수정 권한이 없습니다.'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': '잘못된 JSON 형식입니다.'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)