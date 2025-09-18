


// 비밀번호 유효성 검사 및 일치 확인
const pwInput = document.querySelector("input[name='pw']");
const pw2Input = document.querySelector("input[name='pw2']");

const pwWarning = document.createElement("div");
pwWarning.style.color = "red";
pwWarning.style.fontSize = "15px";
pwWarning.style.marginTop = "20px";
pwWarning.style.marginLeft = "15px";
pwWarning.textContent = "8자 이상 입력하셔야 합니다.";

const matchMessage = document.createElement("div");
matchMessage.style.fontSize = "15px";
matchMessage.style.marginTop = "20px";
matchMessage.style.marginLeft = "15px";

function validatePwLength() {
  const pw = pwInput.value.trim();
  if (pw.length > 0 && pw.length < 8) { // 비밀번호가 입력되었을 때만 길이 검사
    pwInput.style.border = "1.5px solid red";
    if (!pwInput.parentNode.contains(pwWarning)) {
      pwInput.parentNode.appendChild(pwWarning);
    }
    return false;
  } else {
    pwInput.style.border = "";
    if (pwInput.parentNode.contains(pwWarning)) {
      pwInput.parentNode.removeChild(pwWarning);
    }
    return true;
  }
}

pwInput.addEventListener("blur", validatePwLength);

pw2Input.addEventListener("keyup", function () {
  const pw = pwInput.value.trim();
  const pw2 = pw2Input.value.trim();

  // 비밀번호 입력이 없으면 메시지 숨김
  if (pw === "" && pw2 === "") {
    pwInput.style.border = "";
    pw2Input.style.border = "";
    if (pwInput.parentNode.contains(pwWarning)) {
        pwInput.parentNode.removeChild(pwWarning);
    }
    if (pw2Input.parentNode.contains(matchMessage)) {
      pw2Input.parentNode.removeChild(matchMessage);
    }
    return;
  }

  // 첫 번째 비밀번호가 8자 미만일 때는 메시지 표시
  if (pw.length > 0 && pw.length < 8) {
      pw2Input.style.border = "";
      if (pw2Input.parentNode.contains(matchMessage)) {
          pw2Input.parentNode.removeChild(matchMessage);
      }
      return;
  }

  if (pw2 === "") {
    pw2Input.style.border = "";
    if (pw2Input.parentNode.contains(matchMessage)) {
      pw2Input.parentNode.removeChild(matchMessage);
    }
  } else if (pw === pw2) {
    pw2Input.style.border = "1.5px solid green";
    matchMessage.textContent = "비밀번호가 일치합니다.";
    matchMessage.style.color = "green";
    if (!pw2Input.parentNode.contains(matchMessage)) {
      pw2Input.parentNode.appendChild(matchMessage);
    }
  } else {
    pw2Input.style.border = "1.5px solid red";
    matchMessage.textContent = "비밀번호가 일치하지 않습니다.";
    matchMessage.style.color = "red";
    if (!pw2Input.parentNode.contains(matchMessage)) {
      pw2Input.parentNode.appendChild(matchMessage);
    }
  }
});


// 취소 버튼 클릭 시 뒤로가기
document.querySelector("#group_button_1").addEventListener("click", function () {
  if (confirm("회원정보 수정을 취소하시겠습니까? 입력한 정보가 모두 사라집니다.")) {
    window.history.back();
  }
});

// 완료 버튼 클릭 시 유효성 검사 및 폼 제출
document.querySelector("#group_button_2").addEventListener("click", function () {
  const name = document.querySelector("input[name='name']").value.trim();
  const email1 = document.querySelector("input[name='email1']").value.trim();
  const email2 = document.querySelector("input[name='email2']").value.trim();
  const pw = document.querySelector("input[name='pw']").value.trim();
  const pw2 = document.querySelector("input[name='pw2']").value.trim();

  // 필수 항목 검사
  if (!name || !email1 || !email2) {
    alert("이름과 이메일은 필수 항목입니다.");
    return;
  }

  // 비밀번호 검증 (입력된 경우만)
  if (pw.length > 0) { // 비밀번호가 입력되었을 때만 검사
    if (pw.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (pw !== pw2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
  } else if (pw2.length > 0) { // pw가 비어있는데 pw2에만 값이 있는 경우
      alert("비밀번호를 입력해주세요.");
      return;
  }

  // 폼 제출
  document.updateFrm.submit();
});

document.addEventListener("DOMContentLoaded", function() {
    // 관심 분야 (해시태그) 기능 시작
    const input = document.querySelector("input[name='group_keyword_input']");
    const addBtn = document.querySelector(".add_tag_btn");
    const outputArea = document.querySelector(".group_keyword_output");
    const hiddenInput = document.querySelector("#group_keywords_hidden");
    const tagLinks = document.querySelectorAll(".tags a");
    const addedTags = new Set();

    function updateHiddenInput() {
        if (hiddenInput) {
            hiddenInput.value = Array.from(addedTags).join(",");
        }
    }

    function addTag(tagText) {
        if (!tagText || addedTags.has(tagText)) return;

        addedTags.add(tagText);

        const tag = document.createElement("div");
        tag.className = "added-tag";
        tag.textContent = tagText;
        tag.setAttribute("data-tag", tagText);

        const delBtn = document.createElement("span");
        delBtn.className = "tag-delete";
        delBtn.innerHTML = "&times;";

        delBtn.onclick = () => {
            addedTags.delete(tagText);
            tag.remove();
            updateHiddenInput();

            tagLinks.forEach(link => {
                if (link.textContent.trim() === tagText) {
                    link.classList.remove("clicked");
                }
            });
        };

        tag.appendChild(delBtn);
        if (outputArea) {
            outputArea.appendChild(tag);
        }
        updateHiddenInput();
    }

    function addTagFromInput() {
        if (!input) return;
        const value = input.value.trim();
        const tagText = `#${value}`;
        if (!value) return;
        addTag(tagText);
        input.value = "";
    }

    if (input) {
        input.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                addTagFromInput();
            }
        });
    }

    if (addBtn) {
        addBtn.addEventListener("click", addTagFromInput);
    }

    tagLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const tagText = this.textContent.trim();
            if (addedTags.has(tagText)) {
                addedTags.delete(tagText);
                const existingTagElement = outputArea ? outputArea.querySelector(`.added-tag[data-tag="${tagText}"]`) : null;
                if (existingTagElement) {
                    existingTagElement.remove();
                }
                this.classList.remove("clicked");
            } else {
                addTag(tagText);
                this.classList.add("clicked");
            }
            updateHiddenInput();
        });
    });

    if (hiddenInput) {
        const initialGenres = hiddenInput.value;
        if (initialGenres) {
            initialGenres.split(',').forEach(genre => {
                const formattedGenre = genre.startsWith('#') ? genre.trim() : `#${genre.trim()}`;
                addTag(formattedGenre);

                tagLinks.forEach(link => {
                    if (link.textContent.trim() === formattedGenre) {
                        link.classList.add("clicked");
                    }
                });
            });
        }
    }

    // 이메일 선택 로직
    const emailSelect = document.querySelector(".email_select");
    const email2Input = document.querySelector(".email2");

    if (emailSelect && email2Input) {
        emailSelect.addEventListener("change", function () {
            const selected = this.value;

            if (selected === "직접입력") {
                email2Input.value = "";
                email2Input.readOnly = false;
                email2Input.focus();
            } else {
                email2Input.value = selected;
                email2Input.readOnly = true;
            }
        });
    }

    
});