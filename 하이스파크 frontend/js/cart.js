$(document).ready(function(){
    
    //전체주문버튼
    function orderAllBtn(){
        orderFrm.submit();
    }

    // 품목 삭제 버튼
    $(document).on("click",".delete-btn",function(){
        
        //가장 가까운 product-container 위치 변수 선언
        var productContainer = $(this).closest('.product-container');
        
        productContainer.remove(); //해당 컨테이너 삭제
        checkCartEmpty();//장바구니가 비어있는지 확인
        updatePrice();// 가격 업데이트
        
    });//delete-btn
    
    
    // 수량 조절 버튼
    $(document).on("click", ".quantity-btn", function(){
        var input = $(this).siblings('.quantity-input');  // 같은 레벨의 input 찾기
        var currentValue = parseInt(input.val());          // 현재 값 가져오기
        
        if ($(this).text() == '+') {
            input.val(currentValue + 1);
        } else if ($(this).text() == '-' && currentValue > 1) {
            input.val(currentValue - 1);
        }
    });//quantity-btn
    
    // 전체선택 버튼
    $(document).on("click", ".selectAll", function(){
        var checkBoxes = $('input[type="checkbox"]');     // 모든 체크박스 선택
        var allChecked = checkBoxes.filter(':checked').length == checkBoxes.length;  // 모두 체크되었나 확인
        
        checkBoxes.prop('checked', !allChecked); // 모두 체크되어있으면 체크 해제하기 
        if (allChecked) {
            $(this).text("전체선택");
        } else {
            $(this).text("선택해제");
        }
    });//selectall
    
    //선택삭제
    $(document).on("click",".deleteSelected", function(){
        var checkedBoxes = $('input[type="checkbox"]:checked');
        checkedBoxes.each(function(){
            $(this).closest('.product-container').remove();
        });
        
        checkCartEmpty();//장바구니가 비어있는지 확인
        updatePrice();// 가격 업데이트

    });//deleteSelected
    
    

    //장바구니 비어있는지 확인하는 함수
    function checkCartEmpty(){
        //장바구니 내 상품 개수 확인
        var productCount = $(".product-container").length;

        //상품 0개일 때 상품이 없습니다 html 변경
        if(productCount==0){
            $(".cart-content").html('<div class="empty-cart">상품이 없습니다</div>');
        }
    }//checkCartEmpty


    
    function updatePrice() {
        // 실제 가격 계산 로직 구현예정임
        console.log('가격 업데이트');
    }
});