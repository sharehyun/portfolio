document.addEventListener('DOMContentLoaded', () => {
    const addOptionBtn = document.querySelector('.add-option-btn');
    const voteOptionsContainer = document.getElementById('vote-options');

    // 투표 항목 추가 버튼 클릭 이벤트
    addOptionBtn.addEventListener('click', () => {
        const newOptionDiv = document.createElement('div');
        newOptionDiv.classList.add('vote-option');
        newOptionDiv.innerHTML = `
            <input type="text" placeholder="투표 항목을 입력하세요" required>
            <button type="button" class="remove-option-btn">삭제</button>
        `;
        voteOptionsContainer.appendChild(newOptionDiv);
    });

    // 투표 항목 삭제 버튼 클릭 이벤트
    voteOptionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-option-btn')) {
            // 최소 2개의 항목은 유지
            if (voteOptionsContainer.children.length > 2) {
                e.target.closest('.vote-option').remove();
            } else {
                alert('최소 2개의 투표 항목이 필요합니다.');
            }
        }
    });
});