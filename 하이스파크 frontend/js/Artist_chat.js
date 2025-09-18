const textarea = document.querySelector('.chat_text');
const sendBtn = document.querySelector('.sendChatBtn');
const middleDiv = document.querySelector('.middle_div');

let lastChatDate = null; // 마지막 표시한 날짜

function addChat(message, sender = "me") {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];

    // 아직 오늘 날짜가 안 붙었다면, 맨 위에 날짜 삽입
    if (lastChatDate !== currentDate) {
        const options = { year: "numeric", month: "long", day: "numeric", weekday: "long" };
        const dateText = now.toLocaleDateString("ko-KR", options);

        middleDiv.insertAdjacentHTML("afterbegin", `
            <hr class="date_line"/>
            <p class="date">${dateText}</p>
        `);

        lastChatDate = currentDate;
    }

    // 채팅 말풍선 추가
    if (sender === "me") {
        middleDiv.insertAdjacentHTML("beforeend", `
            <div class="chat ch2">
                <div class="textbox">${message}</div>
                <p class="chat_time">${now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
        `);
    } else {
        middleDiv.insertAdjacentHTML("beforeend", `
            <div class="chat ch1">
                <div class="icon"><img class="profile_img" src="images/지온_셀카.png" style="border-radius: 50%;"></div>
                <div class="chat_col">
                    <p class="chat_name">박지온</p>
                    <div class="textbox">${message}</div>
                </div>
                <p class="chat_time">${now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
        `);
    }

    // 스크롤 맨 아래로 이동
    middleDiv.scrollTop = middleDiv.scrollHeight;
}

// 내 메시지 보내기
function sendMessage() {
    const text = textarea.value.trim();
    if (!text) return;

    addChat(text, "me");
    textarea.value = "";
}

sendBtn.addEventListener("click", sendMessage);
textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 테스트: 2초 뒤 상대방 메시지 받기
setTimeout(() => {
    addChat("보고싶었어!!", "other");
}, 7000);
