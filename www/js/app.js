var isSingIn = false;
/*
ログイン中のユーザー情報
*/
var userInfo = {};

/*
* ログイン中の部屋情報
* "room_id","room_name","user_id","is_owned","room_number"
*/
var roomInfo = {};

/*
* グラフ用のカラーリスト
*/
var backgroundColorList = [
    "#F7464A",
    "#46BFBD",
    "#FDB45C",
    "#949FB1"
]


/*
* ローディング中画面を表示
*/
function showLoading(){
    $('ons-modal').show();
}
 
/*
* ローディング中画面を非表示
*/
function hideLoading(){
    $('ons-modal').hide();
}