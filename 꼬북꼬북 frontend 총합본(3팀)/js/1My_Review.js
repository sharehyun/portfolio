$(document).ready(function () {
  $('.comment_item').each(function () {
    const $commentItem = $(this);
    const $moreButton = $commentItem.find('.btn_more_body');

    // 내용이 긴 경우만 버튼 보여줌
    if ($commentItem.hasClass('overflow')) {
      $moreButton.show();
    } else {
      $moreButton.hide();
    }
  });

  $('.btn_more_body').on('click', function () {
    const $button = $(this);
    const $commentItem = $button.closest('.comment_item');
    const isActive = $commentItem.hasClass('active');

    if (!isActive) {
      // 펼치기
      $commentItem.addClass('active');
      $button.addClass('active');
      $button.find('.text').text('접기');
      $button.find('i').removeClass('fa-circle-arrow-down').addClass('fa-circle-arrow-up');

      // 썸네일 숨기고 swiper 보이게
      $commentItem.find('.comment_thumb_box').hide();
      $commentItem.find('.comment_swiper_wrap').show();

    } else {
      // 접기
      $commentItem.removeClass('active');
      $button.removeClass('active');
      $button.find('.text').text('펼치기');
      $button.find('i').removeClass('fa-circle-arrow-up').addClass('fa-circle-arrow-down');

      // swiper 숨기고 썸네일 보이게
      $commentItem.find('.comment_swiper_wrap').hide();
      $commentItem.find('.comment_thumb_box').show();
    }
  });
});

