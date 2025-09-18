document.addEventListener('DOMContentLoaded', () => {
    const voteEndTimeElement = document.getElementById('voteEndTime');
    const voteEndStatusElement = document.getElementById('voteEndStatus');
    const voteEndTime = new Date('2025-09-09T16:00:00');
    const voteItems = document.querySelectorAll('.vote-item');
    const radioInputs = document.querySelectorAll('input[name="voteOption"]');
    const submitButton = document.getElementById('submitButton');
    const voteForm = document.getElementById('voteForm');

    const updateTime = () => {
        const now = new Date();
        const diffMs = voteEndTime.getTime() - now.getTime();
        
        const formattedDate = voteEndTime.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        voteEndTimeElement.textContent = `투표 종료일: ${formattedDate}`;

        if (diffMs > 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            
            voteEndStatusElement.textContent = `투표 진행중 (${diffHours}시간 ${diffMinutes}분 ${diffSeconds}초 남음)`;
            voteEndStatusElement.classList.remove('closed');
            voteEndStatusElement.classList.add('imminent');
        } else {
            voteEndStatusElement.textContent = '투표가 종료되었습니다.';
            voteEndStatusElement.classList.remove('imminent');
            voteEndStatusElement.classList.add('closed');
        }
    };
    
    let lastSelectedRadio = null;

    radioInputs.forEach(radio => {
        radio.addEventListener('click', () => {
            // 투표가 종료되었을 경우 클릭 기능 무시
            if (voteEndStatusElement.classList.contains('closed')) {
                return;
            }
            
            // 이미 선택된 라디오 버튼을 다시 클릭한 경우
            if (lastSelectedRadio && lastSelectedRadio === radio) {
                radio.checked = false;
                lastSelectedRadio = null;
                
                // 제출 버튼 숨기고 상태 메시지 다시 표시
                submitButton.style.display = 'none';
                voteEndStatusElement.style.display = 'block';

                // 클래스 제거
                radio.closest('.vote-item').classList.remove('selected');
            } else {
                // 다른 라디오 버튼을 선택한 경우
                lastSelectedRadio = radio;

                // 제출 버튼 표시하고 상태 메시지 숨기기
                submitButton.style.display = 'block';
                voteEndStatusElement.style.display = 'none';
                
                // 모든 vote-item에서 'selected' 클래스 제거
                voteItems.forEach(item => item.classList.remove('selected'));
                
                // 선택된 vote-item에 'selected' 클래스 추가
                radio.closest('.vote-item').classList.add('selected');
            }
        });
    });

    // '제출하기' 버튼 클릭 시 폼 제출
    voteForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 실제 제출 방지
        
        if (confirm('투표를 제출하시겠습니까? 한 번 선택시 변경 불가합니다.')) {
            alert('투표가 제출되었습니다.');
            // 여기에 실제 데이터 제출 로직 (예: fetch API) 구현
        }
    });

    setInterval(updateTime, 1000);
    updateTime();
});