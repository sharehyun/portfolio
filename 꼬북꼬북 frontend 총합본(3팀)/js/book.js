function toggleBookmark(button) {
    const icon = button.querySelector('i');
    const isSolid = icon.classList.contains('fa-solid');

    // 1. 아이콘을 서서히 투명하게
    icon.classList.add('fading-out');

    // 2. fade-out 후 아이콘 교체
    setTimeout(() => {
    icon.classList.remove('fa-solid', 'fa-regular');
    icon.classList.add(isSolid ? 'fa-regular' : 'fa-solid');
    }, 50); // opacity transition 절반 정도 시점에 교체

    // 3. 다시 서서히 나타나기
    setTimeout(() => {
    icon.classList.remove('fading-out');
    }, 100); // 전체 duration 이후
}

