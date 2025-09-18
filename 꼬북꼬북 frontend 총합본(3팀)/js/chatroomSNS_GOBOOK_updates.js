  // 1) DOMContentLoaded → 초기 설정: 메뉴 닫기, 좋아요·댓글
  document.addEventListener('DOMContentLoaded', () => {
  // 열린 메뉴 모두 닫기
  document.querySelectorAll('.settings-menu, .reply-settings-menu').forEach(m => m.remove());

  // 각 포스트마다 좋아요·댓글 버튼에 카운트 스팬 없으면 추가
  document.querySelectorAll('.post').forEach(post => {
    // 좋아요 버튼 (comment_footer 영역)
    const likeBtn = post.querySelector('.comment_footer .btn_like');
    if (likeBtn && !likeBtn.querySelector('.text')) {
      const span = document.createElement('span');
      span.className = 'text';
      span.textContent = '0';
      likeBtn.appendChild(span);
    }
    // 댓글 버튼
    const replyBtn = post.querySelector('.comment_footer .btn_reply');
    if (replyBtn && !replyBtn.querySelector('.count')) {
      const span = document.createElement('span');
      span.className = 'count';
      // 초기값: 이미 달린 댓글 수
      span.textContent = post.querySelectorAll('.reply_item').length;
      replyBtn.appendChild(span);
    }
  });
});

// 2) 이벤트 위임: 좋아요·댓글·메뉴·댓글등록 처리
document.addEventListener('click', function(e) {
    const feedBtn = e.target.closest('.btn_setting');
      if (feedBtn) {
        e.stopPropagation();
        toggleMenu(
          feedBtn,
          '<button class="edit-post">수정</button><button class="delete-post">삭제</button>',
          'settings-menu'
        );
        return;
        }
        // 1) 피드 수정 버튼 클릭
      if (e.target.matches('.edit-post')) {
        e.stopPropagation();
        const post = e.target.closest('.post');
        const contentEl = post.querySelector('.comment_contents');
        
        const imageHTML = Array
          .from(contentEl.querySelectorAll('img'))
          .map(img => img.outerHTML)
          .join('');

        const newText = prompt('게시글을 수정하세요:', contentEl.textContent.trim());
        if (newText !== null) {
          contentEl.innerHTML = imageHTML + newText;
        }
        document.querySelectorAll('.settings-menu').forEach(m=>m.remove());
        return;
      }

      // 피드 “삭제” 클릭
      if (e.target.matches('.delete-post')) {
        e.stopPropagation();
        const post = e.target.closest('.post');
        if (confirm('정말 이 게시글을 삭제하시겠습니까?')) {
          post.remove();
        }
        return;
      }

  
  // 2-1) 피드 좋아요 클릭
  const feedLike = e.target.closest('.comment_footer .btn_like');
  if (feedLike) {
    e.stopPropagation();
    const icon = feedLike.querySelector('i');
    icon?.classList.replace('fa-regular', 'fa-solid');
    let badge = feedLike.querySelector('.text');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'text';
      feedLike.appendChild(badge);
    }
    badge.textContent = String((parseInt(badge.textContent, 10) || 0) + 1);
    return;
  }

  // 2-2) 피드 댓글 버튼 클릭 → 댓글창 토글 + 댓글 수 갱신
  const feedReply = e.target.closest('.comment_footer .btn_reply');
  if (feedReply) {
    e.stopPropagation();
    const post = feedReply.closest('.post');
    const wrap = post.querySelector('.reply_wrap');
    wrap && wrap.classList.toggle('active');
    updateCommentCount(post);
    return;
  }

  // 2-3) 댓글 등록 (reply_wrap 내 .reply_btn)
  const postReplyBtn = e.target.closest('.reply_btn');
  if (postReplyBtn) {
    const post = postReplyBtn.closest('.post');
    const wrap = post.querySelector('.reply_wrap');
    const ta = wrap.querySelector('#reply_textarea');
    const text = ta.value.trim();
    if (!text) return;
    const item = createReplyItem(text);
    wrap.querySelector('.reply_list').appendChild(item);
    ta.value = '';
    updateCommentCount(post);
    return;
  }

  // 2-4) 댓글 “⋯” 메뉴 토글
  const commentMenuBtn = e.target.closest('.btn_reply_setting');
  if (commentMenuBtn) {
    e.stopPropagation();
    toggleMenu(
      commentMenuBtn,
      `<button class="edit-reply">수정</button><button class="delete-reply">삭제</button>`,
      'reply-settings-menu'
    );
    return;
  }

  // 2-5) 댓글 수정
  if (e.target.matches('.edit-reply')) {
    const item = e.target.closest('.reply_item');
    const contentEl = item.querySelector('.reply_content');
    const newText = prompt('댓글을 수정하세요:', contentEl.textContent.trim());
    if (newText !== null) contentEl.textContent = newText;
    closeAllReplyMenus();
    return;
  }

  // 2-6) 댓글 삭제
  if (e.target.matches('.delete-reply')) {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      const item = e.target.closest('.reply_item');
      const post = item.closest('.post');
      item.remove();
      updateCommentCount(post);
    }
    return;
  }

  // 2-7) 외부 클릭 시 메뉴 닫기
  if (!e.target.closest('.settings-menu')) {
    document.querySelectorAll('.settings-menu').forEach(m => m.remove());
  }
  if (!e.target.closest('.reply-settings-menu')) {
    document.querySelectorAll('.reply-settings-menu').forEach(m => m.remove());
  }
});

// 3) 댓글 아이템 생성 (원본 디자인 그대로)
function createReplyItem(text) {
  const now = new Date();
  const date = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  const time = now.toTimeString().slice(0,5);
  const item = document.createElement('div');
  item.className = 'reply_item';
  item.innerHTML = `
    <div class="reply_header">
      <div class="user_info_box">
        <span class="info_item">나</span>
        <span class="gap"> | </span>
        <span class="info_item">${date} ${time}</span>
      </div>
      <button class="btn_reply_setting">⋯</button>
    </div>
    <div class="reply_content">${text}</div>
  `;
  return item;
}

// 4) 댓글 수 배지 업데이트 (말풍선 옆 .count)
function updateCommentCount(post) {
  const replyBtn = post.querySelector('.comment_footer .btn_reply');
  if (!replyBtn) return;
  const cnt = post.querySelectorAll('.reply_item').length;
  let badge = replyBtn.querySelector('.count');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'count';
    replyBtn.appendChild(badge);
  }
  badge.textContent = String(cnt);
}

// 5) 메뉴 토글 재사용 헬퍼
function toggleMenu(btn, html, cls) {
  const container = btn.parentElement;
  const existing = container.querySelector(`.${cls}`);
  if (existing) { existing.remove(); return; }
  const menu = document.createElement('div');
  menu.className = cls;
  menu.innerHTML = html;
  container.appendChild(menu);
}

// 6) 댓글 메뉴 닫기 헬퍼
function closeAllReplyMenus() {
  document.querySelectorAll('.reply-settings-menu').forEach(m => m.remove());
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
document.querySelectorAll('.comment_contents img').forEach(img => {
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

  let scale = 1, isDrag = false, startX = 0, startY = 0, offX = 0, offY = 0;

  // 1) 이미지 클릭 → 모달 열기
  document.body.addEventListener('click', e => {
    // .comment_contents 내의 <img>를 클릭했을 때
    if (e.target.matches('.comment_contents img')) {
      scale = 1; offX = 0; offY = 0;
      imgEl.src = e.target.src;
      imgEl.style.transform = 'translate(-50%, -50%) translate(0,0) scale(1)';
      modal.style.display = 'block';
    }
  });

  // 2) 모달 배경 클릭 → 모달 닫기
  //modal.addEventListener('click', e => {
  //  if (e.target === modal) closeImageModal();
  //});

  // 3) 닫기 버튼 클릭 → 모달 닫기
  closeBtn.addEventListener('click', closeImageModal);

  // 4) 휠로 줌 인·아웃
  modal.addEventListener('wheel', e => {
    e.preventDefault();
    scale = e.deltaY < 0 ? Math.min(scale + 0.1, 5) : Math.max(scale - 0.1, 1);
    imgEl.style.transform = `translate(-50%, -50%) translate(${offX}px,${offY}px) scale(${scale})`;
  }, { passive: false });

  // 5) 드래그로 이동
  imgEl.addEventListener('mousedown', e => {
    e.preventDefault();
    isDrag = true;
    startX = e.clientX; startY = e.clientY;
    imgEl.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', e => {
    if (!isDrag) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    startX = e.clientX; startY = e.clientY;
    offX += dx; offY += dy;
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
  document.querySelectorAll('.comment_contents img').forEach(img => {
    const setOri = () => {
      // 기존 inline style 제거
      img.removeAttribute('style');
      // 방향에 따라 클래스 추가
      img.classList.remove('landscape','portrait');
      img.classList.add(
        img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait'
      );
    };
    // 로딩 완료 여부 체크
    if (img.complete) setOri();
    else img.addEventListener('load', setOri);
  });
}