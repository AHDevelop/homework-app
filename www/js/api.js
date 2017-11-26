/*
* APIの処理種別定数
*/
var API_METHOD_GET = "get";
var API_METHOD_POST = "post";
var API_METHOD_PUT = "put";
var API_METHOD_DELETE = "delete";



/*
* APIアクセスURLの基本部分を作成する
*/
function buildBaseApiUrl(){

  var protocol = "http";
  var domain = "192.168.0.150";
  var endpoint = "api";
  var version = "v1";

  return protocol + '://' + domain + '/' + endpoint + '/' + version + '/';
}

/*
* API呼び出し共通クラス
*/
function callApi(type, url, dataObj) {

  // ローディング画面表示
  $('body').loading({
    stoppable: true
  });

  var apiKey = "key";

  var resObj = $.ajax({
    type: type,
    url: url,
    dataType: 'json',
    apiKey: apiKey,
    data: dataObj,
  });

  resObj.done(function(response) {
    console.log("接続しました。");
  });

  resObj.fail(function() {
    console.log('接続に失敗しました。URL:' +  url);
    alert('接続に失敗しました。URL:' +  url);
  });
  resObj.always(function() {
  });
  resObj.complete(function(){
    // ローディング画面非表示
    $('body').loading('stop');
  });

  return resObj;
}

/*
*Auth認証情報を受け取りユーザーが登録済みかどうかを返却する
*/
function getOneUser(key){
  var url = buildBaseApiUrl + "users" + '/' + key;

  return callApi(API_METHOD_GET, url);

}

/*
* 家事一覧&家事別時間取得
* http://192.168.33.10/api/v1/homework/2
*/
function getHomeWorkListWithRoomId(roomId){

  var url = buildBaseApiUrl() + "homework" + '/' + roomId;
  var dataObj = {};
  var resultObj = callApi(API_METHOD_GET, url, dataObj);
  // console.log(resultObj);
  return resultObj;
}

/*
* 家事登録
* /api/v1/homeworkhist/update.json
*/
function updateHomeworkHist(roomHomeworkId, homeworkDate, homeworkTime){

  // TODO 共通変数から取得する
  var userId = 1;
  var roomId = 2;

  var url = buildBaseApiUrl() + 'homeworkhist' + '/' + 'update.json';

  var homeworkResult = {};
  homeworkResult["room_home_work_id"] = roomHomeworkId;
  homeworkResult["user_id"] = userId;
  homeworkResult["home_work_date"] = homeworkDate;
  homeworkResult["home_work_time"] = homeworkTime;

  var dataObj = {};
  dataObj['user_id'] = userId;
  dataObj['room_id'] = roomId;
  dataObj['record'] = [homeworkResult];

  return callApi(API_METHOD_POST, url, dataObj);

  // {
  //    user_id: {家事履歴登録者のユーザ_id}
  //    room_id: {部屋_id},
  //    record: [
  //      {
  //        room_home_work_id: {追加する部屋家事ID},
  //        user_id: {家事したユーザID}
  //        home_work_date: {家事日},
  //        home_work_time: {家事時間}
  //      },
  //      {
  //        room_home_work_id: {追加する部屋家事ID},
  //        user_id: {家事したユーザID}
  //        home_work_date: {家事日},
  //        home_work_time: {家事時間}
  //      },
  // }
}

/*
* 部屋別家事登録・更新
*/
function updateRoomHomework(userId, roomId, record){

  var url = buildBaseApiUrl() + "room" + '/' + 'homework' + '/' + 'update.json';

  var dataObj = {};

  // TODO 共通処理からユーザーIDと部屋IDを取得する仕組みを設ける

  dataObj['user_id'] = userId;
  dataObj['room_id'] = roomId;
  dataObj['record'] = record;

  if(record[0]["room_home_work_id"] == ""){
    return callApi(API_METHOD_POST, url, dataObj);
  } else {
    return callApi(API_METHOD_PUT, url, dataObj);
  }
}

/*
* 部屋家事削除
*/
function deleteRoomHomework(userId, roomId, record){

  var url = buildBaseApiUrl() + "room" + '/' + 'homework' + '/' + 'update.json';

  var dataObj = {};

  // TODO 共通処理からユーザーIDと部屋IDを取得する仕組みを設ける

  dataObj['user_id'] = userId;
  dataObj['room_id'] = roomId;
  dataObj['record'] = record;

  return callApi(API_METHOD_DELETE, url, dataObj);
}

/*
* 家事一覧取得
*/
function getRoomHomework(roomId){

  var url = buildBaseApiUrl() + "homework" + '/' + roomId;

  var dataObj = {};

  return callApi(API_METHOD_GET, url, dataObj);
}
