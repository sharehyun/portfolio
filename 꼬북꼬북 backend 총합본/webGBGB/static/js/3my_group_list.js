// 내그룹박스 나가기 요청 및 나가기 스크립트
$(document).on('click', '.outBtn', function () {
  const $bookBox = $(this).closest('.bookbox');
  const id = $bookBox.data('id'); // HTML에서 data-id로 지정된 값
  const cToken = $('meta[name="csrf-token"]').attr('content');

  if (!confirm('정말 그룹에서 나가시겠습니까?')) return;

  $.ajax({
    url: '/mypage/mygroup_delete/',  // 백엔드 URL에 맞게 수정
    type: 'post',
    headers: { 'X-CSRFToken': cToken },
    data: { 'id': id },
    success: function (data) {
      if (data.result === 'success') {
        
        $bookBox.remove(); // DOM에서 제거
        
        // 나갔을때 개수 갱신
        const $countSpan = $("#my_group_count");
        if ($countSpan.length > 0) {
          const text = $countSpan.text();  // text 정의 없으면 에러남
          console.log("기존 텍스트:", text); // 예: "(3)"

          const currentCount = parseInt(text.replace(/[^\d]/g, ''), 10);
          const newCount = currentCount - 1;
          if (newCount <= 0) {
            $countSpan.text('(0)');
          } else {
            $countSpan.text(`(${newCount})`);
          }
        } else {
          alert('삭제 실패: ' + data.message);
        }
        
        };
        alert("그룹에서 나왔습니다.")
      },
      error: function () {
        alert('서버 오류');
      }
    });
  });


// //리뷰박스 클릭시 상세페이지 이동


// document.addEventListener('DOMContentLoaded', function () {
//   console.log("✅ DOMContentLoaded 실행됨");

//   document.addEventListener('click', function (e) {
//     console.log("✅ document 클릭 감지됨");

//     // ❗ 상세페이지 이동 막기
//     if (e.target.closest('.outBtn')) {
//       console.log("그룹나가기버튼 클릭 - 이동 막음");
//       return;
//     }

//     const bookBox = e.target.closest('.bookbox');
//     console.log("bookBox:", bookBox);

//     if (!bookBox) return;

//     const chatId = bookBox.dataset.chatId;
//     console.log("📘 클릭된 chatId:", chatId);

//     window.location.href = `/sns_feed/${chatId}/`;
//   });
// });


document.addEventListener('DOMContentLoaded', function () {
  console.log("✅ DOMContentLoaded 실행됨");

  document.addEventListener('click', function (e) {
    console.log("✅ document 클릭 감지됨");

    // 그룹 나가기 버튼 클릭 시 상세페이지 이동 막기
    if (e.target.closest('.outBtn')) {
      console.log("❗ 그룹나가기버튼 클릭 - 이동 막음");
      return;
    }

    const bookBox = e.target.closest('.bookbox');
    console.log("📦 클릭된 bookBox:", bookBox);

    // bookBox가 없다면 아무 동작 안 함
    if (!bookBox) return;

    const groupId = bookBox.dataset.groupId;
    console.log("📘 클릭된 chatId:", groupId);

    // chatId가 없거나 비어 있으면 이동 안 함
    if (!groupId) {
      console.warn("⛔ chatId가 비어 있어 이동 취소");
      return;
    }

    // 정상적으로 chatId가 있으면 상세페이지로 이동
    window.location.href = `/feedpage/sns_feed/${groupId}/`;
  });
});








