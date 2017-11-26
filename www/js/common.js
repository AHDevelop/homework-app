function showWorkDetail(){
  var modal = document.getElementById('workDetail');
  modal.animation = "fade";
  modal.show();
}

/**
*
**/
function showInviteModal (){
  var inviteModal = document.getElementById('inviteModal');
  inviteModal.show();
}


/*
* 家事登録ダイアログで家事時間を加算する
*/
function plusHour(obj){
  var targetElm = $(obj).siblings(".hourLabel");
  var hour =  Number(targetElm.html());

  if(24 <= hour){
    return false;
  }
  hour += 0.5;

  var hourStr = hour.toString();
  if(!hourStr.match(/\./)){
    hourStr += ".0"
  }

  targetElm.html(hourStr);
}

/*
* 家事登録ダイアログで家事時間を減算する
*/
function minusHour(obj){
  var targetElm = $(obj).siblings(".hourLabel");
  var hour =  Number(targetElm.html());

  if(hour <= 0){
    return false;
  }

  hour -= 0.5;
  var hourStr = hour.toString();

  if(!hourStr.match(/\./)){
    hourStr += ".0"
  }

  targetElm.html(hourStr);
}

// function callApi(url, param){
//
//   var deferred = $.Deferred();
//
//   $.ajax({
//       url: url,
//       type: 'GET',
//       data: param,
//       dataType: 'json',
//       error: function(jqXHR, text_status, strError) {
//         alert("通信に失敗しました。  " + text_status + "  " + strError);
//         deferred.reject(jqXHR);
//       },
//       success: function(data) {
//           deferred.resolve(data);
//       }
//   });
//
//   return deferred.promise();
//
// }
