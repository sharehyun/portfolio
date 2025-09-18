$(document).ready(function(){

    //좌측상단 이전페이지로 이동
    $(document).on("click", "#backBtn", function() {
        history.back();
    });// backBtn

    //팝업창 오픈
    let popupWindows = []; //팝업창 연결(결제완료시 팝업창 제거용)
    
    $(document).on("click", "#shoppingterms-details", function () {
        popupWindows.push(
            window.open("policy_shoppingterms.html", "shoppingterms", "width=400,height=600,left=100,top=50")
        );
    });
    
    $(document).on("click", "#personalinfo-details", function () {
        popupWindows.push(
            window.open("policy_personalinfo.html", "personalinfo", "width=400,height=600,left=120,top=70")
        );
    });
    
    $(document).on("click", "#thirdparty-details", function () {
        popupWindows.push(
            window.open("policy_thirdparty.html", "thirdparty", "width=400,height=600,left=140,top=90")
        );
    });

    
    //결제버튼
    $(document).on("click", "#payBtn", function() {
        alert("결제 진행");
        $(".orderFrm").submit();
    });//payBtn

    // form submit 시 팝업들 닫기
    $(document).on("submit", "#orderFrm", function () {
        popupWindows.forEach(function (w) {
            if (w && !w.closed) {
                w.close();
            }
        });
        popupWindows = []; // 초기화
    });
    
    
    //배송메모
    $('.deliveryMessage').change(function() {
        if ($(this).val() == "selfText") {
            $("#deliveryText").css("display", "block");
        } else {
            $("#deliveryText").css("display", "none");
        }
    }); // 배송메모

    //결제수단
    $("input:radio[name=paymethod]").change(function(){
        if(this.value == 'creditcard'){
            $(".paymethod-detail").css("display","none");
            $("#creditcard-detail").css("display","block");
        }else if(this.value == 'transfer'){
            $(".paymethod-detail").css("display","none");
            $("#transfer-detail").css("display","block");
        }else if(this.value == 'virtualAccount'){
            $(".paymethod-detail").css("display","none");
            $("#virtualAccount-detail").css("display","block");
        }else if(this.value == 'paidCredit'){
            $(".paymethod-detail").css("display","none");
            $("#paidCredit-detail").css("display","block");
        }
    }); //결제수단

    // 모두 동의 체크박스 클릭 시
    $('#allconfirm').change(function() {
        var isChecked = $(this).is(':checked');
        $('#shoppingterms, #personalinfo, #thirdparty').prop('checked', isChecked);
    });
    
    // 개별 체크박스 클릭 시 모두 동의 해제
    $('#shoppingterms, #personalinfo, #thirdparty').change(function() {
        var totalCheckboxes = $('#shoppingterms, #personalinfo, #thirdparty').length;
        var checkedCheckboxes = $('#shoppingterms:checked, #personalinfo:checked, #thirdparty:checked').length;
        
        $('#allconfirm').prop('checked', totalCheckboxes === checkedCheckboxes);
    });//allconfirm

    $(document).on("click","#payAll",function(){
        alert("냥");
        $("#paidCreditValue").val("45600");
    });

});//jquery