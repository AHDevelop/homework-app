/*
* タイムゾーンの設定
*/
moment.tz.add("Asia/Tokyo|JST JDT|-90 -a0|010101010|-QJJ0 Rb0 1ld0 14n0 1zd0 On0 1zd0 On0|38e6");
moment.tz.add("Asia/Ho_Chi_Minh|LMT PLMT +07 +08 +09|-76.E -76.u -70 -80 -90|0123423232|-2yC76.E bK00.a 1h7b6.u 5lz0 18o0 3Oq0 k5b0 aW00 BAM0|90e5");
moment.tz.link('Asia/Ho_Chi_Minh|Asia/Saigon');
moment.tz.setDefault("Asia/Tokyo");

var isSingIn = false;
/*
* ログイン中のユーザー情報
* user_id, email, user_name, auth_type, auth_id, access_token
*/
var userInfo = {};

/*
* ログイン中の部屋情報
* "room_id","room_name","user_id","is_owned","room_number"
*/
var roomInfo = {};

/*
* ローディング中画面を表示
*/
function showLoading(){
  current_scrollY = $("ons-page#top .page__content").scrollTop();
  $('ons-modal').css("top", current_scrollY);
  $('ons-modal').show();
}
 
/*
* ローディング中画面を非表示
*/
function hideLoading(){
    $('ons-modal').hide();
}