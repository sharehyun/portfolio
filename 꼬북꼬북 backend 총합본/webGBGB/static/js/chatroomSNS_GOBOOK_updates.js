// 1) DOMContentLoaded → 초기 설정: 메뉴 닫기, 게시물 로드
document.addEventListener('DOMContentLoaded', () => {
    // 열린 메뉴 모두 닫기
    document.querySelectorAll('.settings-menu, .reply-settings-menu').forEach(m => m.remove());

    // 모든 post_item에 대해 초기 댓글/좋아요 수 업데이트 및 대댓글 섹션 추가
    document.querySelectorAll('.post_item').forEach(postItem => {
        updateCommentCount(postItem); // 댓글 수 업데이트
        // 좋아요 아이콘 클래스 및 텍스트 업데이트 (Django 템플릿에서 초기값 설정하므로 필요 시 주석 해제)
        // const likeBtn = postItem.querySelector('.btn_like');
        // if (likeBtn) {
        //     const icon = likeBtn.querySelector('i');
        //     if (likeBtn.classList.contains('active')) { // Django 템플릿의 active 클래스 확인
        //         icon.classList.replace('fa-regular', 'fa-solid');
        //     } else {
        //         icon.classList.replace('fa-solid', 'fa-regular');
        //     }
        // }

        // 기존 댓글에 대댓글 입력창 및 리스트 영역 동적으로 추가 (템플릿에서 이미 렌더링되므로, 동적 추가 대신 토글 로직 유지)
        postItem.querySelectorAll('.reply_item').forEach(replyItem => {
            // 대댓글 수 업데이트 (버튼 옆에 표시될 경우)
            updateNestedReplyCount(replyItem);
        });
    });

    // 게시물 작성 폼 제출 (AJAX 처리)
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // 폼의 기본 제출 동작 막기

            const formData = new FormData(this); // 폼 데이터 가져오기

            try {
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData, // FormData 객체를 직접 전달
                    // CSRF 토큰은 FormData가 자동으로 포함하지 않으므로, 직접 헤더에 추가하거나 hidden input으로 보내야 함
                    // Django 템플릿에 <meta name="csrf-token" content="{{ csrf_token }}"> 가 있다면 아래 헤더 추가
                    headers: {
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                const data = await response.json();

                if (data.status === 'success') {
                    alert(data.message);
                    // 성공 시 입력 필드 초기화
                    document.getElementById('post-input').value = '';
                    document.getElementById('image-upload').value = ''; // 파일 입력 필드 초기화
                    document.getElementById('image-preview').innerHTML = ''; // 이미지 미리보기 제거

                    // 게시물 목록을 새로고침하여 새 게시물 반영
                    location.reload(); 

                } else {
                    alert('게시물 작성 실패: ' + data.message);
                }
            } catch (error) {
                console.error('게시물 작성 중 오류 발생:', error);
                alert('게시물 작성 중 오류가 발생했습니다.');
            }
        });
    }
});

// 2) 이벤트 위임: 모든 클릭 이벤트를 여기서 처리
document.addEventListener('click', function(e) {
    // 2-1) 게시물 설정 버튼 (⋯) 클릭
    const postSettingBtn = e.target.closest('.btn_setting');
    if (postSettingBtn) {
        e.stopPropagation(); // 이벤트 버블링 중단
        const postId = postSettingBtn.dataset.postId;
        toggleMenu(
            postSettingBtn,
            `<button class="edit-post-btn" data-post-id="${postId}">수정</button><button class="delete-post-btn" data-post-id="${postId}">삭제</button>`,
            'settings-menu'
        );
        return;
    }

    // 2-2) 게시물 수정 버튼 클릭 (.edit-post-btn)
    if (e.target.matches('.edit-post-btn')) {
        e.stopPropagation();
        const postId = e.target.dataset.postId;
        const postItem = e.target.closest('.post_item');
        const postTextEl = postItem.querySelector('.post_text');
        const currentContent = postTextEl.textContent.trim();

        const newText = prompt('게시글을 수정하세요:', currentContent);
        if (newText !== null && newText.trim() !== '' && newText.trim() !== currentContent) {
            updatePost(postId, newText.trim(), postTextEl);
        }
        closeAllMenus();
        return;
    }

    // 2-3) 게시물 삭제 버튼 클릭 (.delete-post-btn)
    if (e.target.matches('.delete-post-btn')) {
        e.stopPropagation();
        const postId = e.target.dataset.postId;
        if (confirm('정말 이 게시글을 삭제하시겠습니까?')) {
            deletePost(postId, e.target.closest('.post_item'));
        }
        closeAllMenus();
        return;
    }

    // 2-4) 게시물 좋아요 버튼 클릭 (.btn_like)
    const likeBtn = e.target.closest('.btn_like');
    if (likeBtn) {
        e.stopPropagation();
        const postId = likeBtn.dataset.postId;
        toggleLike(postId, likeBtn);
        return;
    }

    // 2-5) 게시물 댓글 버튼 클릭 (.btn_reply) → 댓글창 토글
    const postReplyBtn = e.target.closest('.btn_reply');
    if (postReplyBtn) {
        e.stopPropagation();
        const postItem = postReplyBtn.closest('.post_item');
        const replyWrap = postItem.querySelector('.reply_wrap');
        if (replyWrap) {
            replyWrap.style.display = replyWrap.style.display === 'none' ? 'block' : 'none';
            // 댓글창이 열릴 때 textarea에 포커스 (선택 사항)
            if (replyWrap.style.display === 'block') {
                replyWrap.querySelector('.reply_textarea')?.focus();
            }
        }
        return;
    }

    // 2-6) 일반 댓글 등록 버튼 클릭 (.reply_btn)
    const submitReplyBtn = e.target.closest('.reply_btn');
    if (submitReplyBtn && !submitReplyBtn.classList.contains('btn_submit_nested_reply')) { // 대댓글 등록 버튼과 구분
        e.stopPropagation();
        const postItem = submitReplyBtn.closest('.post_item');
        const replyForm = submitReplyBtn.closest('.replyForm');
        const textarea = replyForm.querySelector('.reply_textarea');
        const content = textarea.value.trim();
        const postId = replyForm.querySelector('input[name="post_id"]').value;

        if (!content) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        // --- 기존 replyForm.submit() 대신 AJAX 호출로 변경 ---
        addCommentAjax(postId, content, postItem, textarea); // 새로운 AJAX 함수 호출
        return;
    }

    // 2-7) 댓글 설정 버튼 (⋯) 클릭 (.btn_reply_setting)
    const replySettingBtn = e.target.closest('.btn_reply_setting');
    if (replySettingBtn) {
        e.stopPropagation();
        const commentId = replySettingBtn.dataset.commentId;
        toggleMenu(
            replySettingBtn,
            `<button class="edit-comment-btn" data-comment-id="${commentId}">수정</button><button class="delete-comment-btn" data-comment-id="${commentId}">삭제</button>`,
            'reply-settings-menu'
        );
        return;
    }

    // 2-8) 댓글 수정 버튼 클릭 (.edit-comment-btn)
    if (e.target.matches('.edit-comment-btn')) {
        e.stopPropagation();
        const commentId = e.target.dataset.commentId;
        const replyItem = e.target.closest('.reply_item');
        const replyTextEl = replyItem.querySelector('.reply_text');
        const currentContent = replyTextEl.textContent.trim();

        const newText = prompt('댓글을 수정하세요:', currentContent);
        if (newText !== null && newText.trim() !== '' && newText.trim() !== currentContent) {
            updateComment(commentId, newText.trim(), replyTextEl);
        }
        closeAllMenus();
        return;
    }

    // 2-9) 댓글 삭제 버튼 클릭 (.delete-comment-btn)
    if (e.target.matches('.delete-comment-btn')) {
        e.stopPropagation();
        const commentId = e.target.dataset.commentId;
        if (confirm('정말 이 댓글을 삭제하시겠습니까?')) {
            deleteComment(commentId, e.target.closest('.reply_item'));
        }
        closeAllMenus();
        return;
    }

    // 2-10) 대댓글 토글 버튼 클릭 (.btn_reply_reply)
    const nestedReplyToggleBtn = e.target.closest('.btn_reply_reply');
    if (nestedReplyToggleBtn) {
        e.stopPropagation();
        const replyItem = nestedReplyToggleBtn.closest('.reply_item');
        const nestedReplyInputArea = replyItem.querySelector('.nested_reply_input_area');
        if (nestedReplyInputArea) {
            nestedReplyInputArea.style.display = nestedReplyInputArea.style.display === 'none' ? 'flex' : 'none';
            if (nestedReplyInputArea.style.display === 'flex') {
                nestedReplyInputArea.querySelector('.nested_reply_textarea')?.focus();
            }
        }
        return;
    }

    // 2-11) 대댓글 등록 버튼 클릭 (.btn_submit_nested_reply)
    const submitNestedReplyBtn = e.target.closest('.btn_submit_nested_reply');
    if (submitNestedReplyBtn) {
        e.stopPropagation();
        const parentCommentId = submitNestedReplyBtn.dataset.parentCommentId;
        const nestedReplyInputArea = submitNestedReplyBtn.closest('.nested_reply_input_area');
        const textarea = nestedReplyInputArea.querySelector('.nested_reply_textarea');
        const content = textarea.value.trim();

        if (!content) {
            alert('답글 내용을 입력해주세요.');
            return;
        }

        addNestedReplyAjax(parentCommentId, content, nestedInputArea);
        return;
    }

    // 2-12) 외부 클릭 시 모든 메뉴 닫기
    closeAllMenus();
});


// ========================= 기능 함수 =========================

// 메뉴 토글 헬퍼 함수
function toggleMenu(btn, html, cls) {
    const container = btn.parentElement; // 설정 버튼의 부모 요소 (.right_area)
    // 기존에 열려있는 동일한 클래스의 메뉴가 있다면 제거 (토글 기능)
    const existingMenu = container.querySelector(`.${cls}`);
    if (existingMenu) {
        existingMenu.remove();
    } else {
        // 모든 메뉴 닫기 (새로운 메뉴를 열기 전 다른 메뉴 닫기)
        closeAllMenus();
        const menu = document.createElement('div');
        menu.className = cls;
        menu.innerHTML = html;
        // 메뉴 위치를 설정 버튼 바로 아래에 배치
        menu.style.position = 'absolute';
        menu.style.backgroundColor = 'white';
        menu.style.border = '1px solid #ddd';
        menu.style.borderRadius = '5px';
        menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        menu.style.zIndex = '100';
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        menu.style.overflow = 'hidden';
        menu.style.right = '0'; // 버튼 기준으로 오른쪽 정렬
        menu.style.top = '25px'; // 버튼 아래에 나타나도록 조정 (필요 시 조정)

        container.style.position = 'relative'; // 부모 요소를 기준으로 position: absolute; 가 작동하도록
        container.appendChild(menu);
    }
}

// 모든 메뉴 닫기 헬퍼
function closeAllMenus() {
    document.querySelectorAll('.settings-menu, .reply-settings-menu').forEach(m => m.remove());
}


// 게시물 수정 AJAX 요청
async function updatePost(postId, newContent, postTextEl) {
    let cToken = $('meta[name="csrf-token"]').attr('content');
    try {
        const response = await fetch('/feedpage/post/edit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': cToken
            },
            body: JSON.stringify({
                post_id: postId,
                content: newContent
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            postTextEl.textContent = data.content;
            alert('게시글이 수정되었습니다.');
        } else {
            alert('게시글 수정 실패: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating post:', error);
        alert('게시글 수정 중 오류가 발생했습니다.');
    }
}

// 게시물 삭제 AJAX 요청
async function deletePost(postId, postItemEl) {
    let cToken = $('meta[name="csrf-token"]').attr('content');
    try {
        const response = await fetch('/feedpage/post/delete/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': cToken
            },
            body: JSON.stringify({
                post_id: postId
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            postItemEl.remove();
            alert('게시글이 삭제되었습니다.');
        } else {
            alert('게시글 삭제 실패: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
    }
}

// 댓글 수정 AJAX 요청
async function updateComment(commentId, newContent, replyTextEl) {
    let cToken = $('meta[name="csrf-token"]').attr('content');
    try {
        const response = await fetch('/feedpage/reply/edit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': cToken
            },
            body: JSON.stringify({
                comment_id: commentId,
                content: newContent
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            replyTextEl.textContent = data.content;
            alert('댓글이 수정되었습니다.');
        } else {
            alert('댓글 수정 실패: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        alert('댓글 수정 중 오류가 발생했습니다.');
    }
}

// 댓글 삭제 AJAX 요청
async function deleteComment(commentId, replyItemEl) {
    let cToken = $('meta[name="csrf-token"]').attr('content');
    try {
        const response = await fetch('/feedpage/reply/delete/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': cToken
            },
            body: JSON.stringify({
                comment_id: commentId
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            const postItem = replyItemEl.closest('.post_item');
            replyItemEl.remove();
            updateCommentCount(postItem); // 댓글 수 업데이트
            alert('댓글이 삭제되었습니다.');
        } else {
            alert('댓글 삭제 실패: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
    }
}


// 좋아요 토글 AJAX 요청
async function toggleLike(postId, button) {
    let cToken = $('meta[name="csrf-token"]').attr('content');
    const icon = button.querySelector('i');
    const countSpan = button.querySelector('.text');

    try {
        const response = await fetch('/feedpage/like/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': cToken
            },
            body: JSON.stringify({
                post_id: postId
            })
        });
        const data = await response.json();
        if (data.error) {
            alert(data.error);
            return;
        }

        // 좋아요 상태 업데이트
        if (data.liked !== undefined) {
            icon.classList.remove('fa-solid', 'fa-regular');
            icon.classList.add(data.liked ? 'fa-solid' : 'fa-regular');
            button.classList.toggle('active', data.liked); // active 클래스 토글
        }

        // 좋아요 수 업데이트
        if (typeof data.like_count !== "undefined") {
            if (countSpan) countSpan.textContent = data.like_count;
        }

        // 애니메이션 효과 (필요 시)
        icon.classList.add('fading-out');
        setTimeout(() => {
            icon.classList.remove('fading-out');
        }, 100);

    } catch (error) {
        console.error('Error toggling like:', error);
        alert('좋아요 처리 중 오류가 발생했습니다.');
    }
}

// 댓글 수 배지 업데이트 (말풍선 옆 .count)
function updateCommentCount(post) {
    const replyBtn = post.querySelector('.comment_footer .btn_reply');
    if (!replyBtn) return;
    // 최상위 댓글만 카운트 (nested_reply 클래스가 없는 댓글)
    const cnt = post.querySelectorAll('.reply_item:not(.nested_reply)').length;
    let badge = replyBtn.querySelector('.count');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'count';
        replyBtn.appendChild(badge);
    }
    badge.textContent = String(cnt);
}

// 특정 댓글 아이템의 대댓글 수를 업데이트하는 함수
function updateNestedReplyCount(replyItem) {
    const nestedReplyCountSpan = replyItem.querySelector('.btn_reply_reply .count'); // 대댓글 버튼 안의 .count 스팬
    if (nestedReplyCountSpan) {
        const nestedReplyList = replyItem.querySelector('.nested_reply_list');
        if (nestedReplyList) {
            const count = nestedReplyList.querySelectorAll('.reply_item.nested_reply').length;
            nestedReplyCountSpan.textContent = String(count);
        } else {
            nestedReplyCountSpan.textContent = '0'; // 대댓글 리스트가 없으면 0으로 설정
        }
    }
}


// 이미지 미리보기 기능
function handleImageUpload(event) {
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = ''; // 기존 미리보기 제거
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.marginBottom = '10px';
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

// 대댓글 등록 AJAX (폼 전송 대신 AJAX 처리)
async function addNestedReplyAjax(parentCommentId, content, nestedInputArea) {
    let cToken = $('meta[name="csrf-token"]').attr('content');
    try {
        const response = await fetch('/feedpage/reply/create/', { // Django views.py의 reply_create 사용
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // JSON 형식으로 보냄
                'X-CSRFToken': cToken
            },
            body: JSON.stringify({
                post_id: nestedInputArea.closest('.post_item').dataset.postId, // 부모 게시물의 ID
                content: content,
                parent_comment_id: parentCommentId // 부모 댓글 ID
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            const parentReplyItem = nestedInputArea.closest('.reply_item');
            const nestedReplyList = parentReplyItem.querySelector('.nested_reply_list');
            const newComment = data.comment; // 서버에서 반환된 새로운 댓글 데이터

            // 새로운 대댓글 HTML 요소 생성
            const newReplyHtml = `
                <div class="reply_item nested_reply" data-comment-id="${newComment.id}">
                    <div class="user_info_box" style="margin-left: 15px;">
                        <span class="info_item">${newComment.member_name}</span>
                        <span class="gap"></span>
                        <span class="info_item">${newComment.created_at}</span>
                        <button type="button" class="btn_reply_setting" data-comment-id="${newComment.id}">
                            <i class="fa-solid fa-ellipsis" style="color: #333333;"></i>
                        </button>
                    </div>
                    <div class="reply_contents" style="margin-top: 10px;">
                        <div class="reply_text" data-comment-id="${newComment.id}" style="margin-left: 10px;">${newComment.content}</div>
                    </div>
                </div>
            `;
            nestedReplyList.insertAdjacentHTML('beforeend', newReplyHtml); // 목록의 끝에 추가

            nestedInputArea.querySelector('.nested_reply_textarea').value = ''; // 입력창 비우기
            nestedInputArea.style.display = 'none'; // 대댓글 입력창 닫기
            updateNestedReplyCount(parentReplyItem); // 부모 댓글의 대댓글 수 업데이트
            updateCommentCount(parentReplyItem.closest('.post_item')); // 게시물 전체 댓글 수 업데이트

        } else {
            alert('답글 등록 실패: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding nested reply:', error);
        alert('답글 등록 중 오류가 발생했습니다.');
    }
}

// 새로운 함수: 일반 댓글 등록 AJAX 처리
async function addCommentAjax(postId, content, postItemEl, textareaEl) {
    let cToken = $('meta[name="csrf-token"]').attr('content');
    try {
        const response = await fetch('/feedpage/reply/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // JSON 형식으로 보냄
                'X-CSRFToken': cToken
            },
            body: JSON.stringify({
                post_id: postId,
                content: content,
                // parent_comment_id는 최상위 댓글이므로 보내지 않음
            })
        });
        const data = await response.json();
        if (data.status === 'success') {
            const replyListArea = postItemEl.querySelector('.reply_list');
            const newComment = data.comment;

            // 새로운 댓글 HTML 요소 생성
            const newCommentHtml = `
                <div class="reply_item" data-comment-id="${newComment.id}">
                    <div class="user_info_box" style="margin-left: 15px;">
                        <span class="info_item">${newComment.member_name}</span>
                        <span class="gap"></span>
                        <span class="info_item">${newComment.created_at}</span>
                        <span class="gap"></span>
                        <button type="button" class="btn_reply_setting" data-comment-id="${newComment.id}">
                            <i class="fa-solid fa-ellipsis" style="color: #333333;"></i>
                        </button>
                    </div>
                    <div class="reply_contents" style="margin-top: 10px;">
                        <div class="reply_text" data-comment-id="${newComment.id}" style="margin-left: 10px;">${newComment.content}</div>
                        <div class="comment_footer">
                            <div class="right_area">
                                <button class="btn_reply_reply" type="button" data-comment-id="${newComment.id}">
                                    <i class="fa-regular fa-comment-dots" aria-hidden="true"></i>
                                    <span class="count">0</span>
                                </button>
                            </div>
                        </div>
                        <div class="nested_reply_input_area" style="display: none;">
                            <textarea class="nested_reply_textarea" name="nestedreplytext" placeholder="답글 달기..." style="height: 63px;"></textarea>
                            <button type="button" class="btn_submit_nested_reply" data-parent-comment-id="${newComment.id}">등록</button>
                        </div>
                        <div class="nested_reply_list" style="margin-left: 30px;"></div>
                    </div>
                </div>
            `;
            replyListArea.insertAdjacentHTML('beforeend', newCommentHtml); // 목록의 끝에 추가

            textareaEl.value = ''; // 입력창 비우기
            updateCommentCount(postItemEl); // 게시물 전체 댓글 수 업데이트

        } else {
            alert('댓글 등록 실패: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('댓글 등록 중 오류가 발생했습니다.');
    }
}


// --- 모달 닫기 함수 추가 ---
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    const imgEl = document.getElementById('modal-img');
    const closeBtn = modal.querySelector('.image-modal-close');
    applyImageOrientation();
    // --- 이미지 방향에 따라 클래스 붙이기 ---
    document.querySelectorAll('.post_contents img').forEach(img => {

        const applyClass = () => {
            const cls = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
            img.classList.add(cls);
        };
        if (img.complete) {
            applyClass();
        } else {
            img.addEventListener('load', applyClass);
        }
    });

    let scale = 1,
        isDrag = false,
        startX = 0,
        startY = 0,
        offX = 0,
        offY = 0;

    // 1) 이미지 클릭 → 모달 열기
    document.body.addEventListener('click', e => {
        // .comment_contents 내의 <img>를 클릭했을 때
        if (e.target.matches('.post_contents img')) {

            scale = 1;
            offX = 0;
            offY = 0;
            imgEl.src = e.target.src;
            imgEl.style.transform = 'translate(-50%, -50%) translate(0,0) scale(1)';
            modal.style.display = 'block';
        }
    });

    // 3) 닫기 버튼 클릭 → 모달 닫기
    closeBtn.addEventListener('click', closeImageModal);

    // 4) 휠로 줌 인·아웃
    modal.addEventListener('wheel', e => {
        e.preventDefault();
        scale = e.deltaY < 0 ? Math.min(scale + 0.1, 5) : Math.max(scale - 0.1, 1);
        imgEl.style.transform = `translate(-50%, -50%) translate(${offX}px,${offY}px) scale(${scale})`;
    }, {
        passive: false
    });

    // 5) 드래그로 이동
    imgEl.addEventListener('mousedown', e => {
        e.preventDefault();
        isDrag = true;
        startX = e.clientX;
        startY = e.clientY;
        imgEl.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', e => {
        if (!isDrag) return;
        const dx = e.clientX - startX,
            dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        offX += dx;
        offY += dy;
        imgEl.style.transform = `translate(-50%, -50%) translate(${offX}px,${offY}px) scale(${scale})`;
    });
    document.addEventListener('mouseup', () => {
        if (isDrag) {
            isDrag = false;
            imgEl.style.cursor = 'grab';
        }
    });
    imgEl.style.cursor = 'grab';
});
// ── 이미지 방향에 따라 클래스 붙이는 함수 ──
function applyImageOrientation() {
    document.querySelectorAll('.post_contents img').forEach(img => {

        const setOri = () => {
            // 기존 inline style 제거
            img.removeAttribute('style');
            // 방향에 따라 클래스 추가
            img.classList.remove('landscape', 'portrait');
            img.classList.add(
                img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait'
            );
        };
        // 로딩 완료 여부 체크
        if (img.complete) setOri();
        else img.addEventListener('load', setOri);
    });
}