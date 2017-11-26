
/*
Onsen UIの注入
*/
var module = ons.bootstrap('myApp', ['onsen']);
angular.module("app", ["angular-loading-bar"]);
// module.config(function ($routeProvider) {
//     $routeProvider
//         .when('/addHomeworkPageController', {
//             templateUrl: 'views/main.html',
//             controller: 'addHomeworkPageController'
//         })
// });


/*
サイドメニューコントローラーを初期化
*/
module.controller('SplitterController', function() {
    this.load = function(page) {
      mySplitter.content.load(page)
        .then(function() {
          mySplitter.left.close();
        });
    };
});

/*
メニュー内のイベントコントローラー
*/
module.controller('menuPageController', function($scope) {

// TODO ほかのイベントもここで定義する
    $scope.signout = function(){
      isSingIn = false;
      $scope.splitter.load('login.html')
    };
});

/*
サインインページコントローラ
*/
module.controller("signinPageController", function($scope) {

  $scope.signin = function(){
    isSingIn = true;
    myNavigator.replacePage('layout.html');
  };
  $scope.invite = function(){
    isSingIn = true;
    myNavigator.replacePage('general_user_signin.html');
  };
  $scope.fbLogin = function(){
    isSingIn = true;
    myNavigator.replacePage('fb_auth_dummy.html');
  };
  $scope.callApi = function(){
    callApiWrapper('');
  };


  /*
  Googleログイン
  */
  $scope.googleLogin = function(){

      googleAuth.callGoogle().done(function(data) {
        if(googleAuth.gmailID != ""){

          alert("IDは" + googleAuth.gmailID + "です");

          myNavigator.replacePage('layout.html');

        } else {
          alert("Google認証情報を取得できていません");
        }
      });
      isSingIn = true;
  };
});

/*
招待ユーザーサインインページコントローラ
*/
module.controller("generalUserSigninPageController", function($scope) {

  $scope.signin = function(){
    isSingIn = true;
    myNavigator.replacePage('layout.html');
  };

});

/*
*TOPページコントローラ
*/
module.controller("topPageController", function($scope) {

   // 現在日時の設定
   $scope.nowDate = moment().format('YYYY年MM月DD日');

   var roomId = 2;
   getHomeWorkListWithRoomId(roomId).done(function(response){
     $scope.roomHomeworkList = response;

     // 最新の情報で更新
     $scope.$apply();
   });

   // 家事時間入力ダイアログを表示
   $scope.callInputHomeWorkPage = function(index){

     // IDから該当する家事を特定する
     var roomHomework = $scope.roomHomeworkList[index];

     // 家事名と標準時間を設定した状態でダイアログを起動する
     ons.createDialog('inputHomeWork.html', {parentScope: $scope}).then(function(dialog) {
         $scope.inputHomeWork = dialog;
         $scope.homeworkName = roomHomework.home_work_name;
         $scope.roomHomeworkId = roomHomework.room_home_work_id;
         $scope.beseHomeworkTimeHH = 2; // TODO APIの返却値に基準時間追加されるの待ち
         $scope.inputHomeWork.show();

         // 家事登録
         $scope.inputHomeWork.register = function(roomHomeworkId2){
            var homeworkTime = Number($("#hourLabel").html());
            homeworkDate = moment().format('YYYY-MM-DD');;
            updateHomeworkHist(roomHomeworkId2, homeworkDate, homeworkTime).done(function(response){
                $scope.inputHomeWork.hide();
                $scope.$apply();
                getHomeWorkListWithRoomId(roomId).done(function(response){
                  $scope.roomHomeworkList = response;

                  // 最新の情報で更新
                  $scope.$apply();
                });
            });
         };
       });
   }
});

/*
グラフページコントローラ
*/
module.controller("graphPageController", function($scope) {

  // 画面の初期化イベント
  document.addEventListener("pageinit", function(e) {
      chatByUsers();
      $scope.chatByUsers = chatByUsers;
      $scope.chatByWorks = chatByWorks;
  }, false);
});

/*
家事追加、編集ページコントローラ
*/
module.controller("addHomeworkPageController", function($scope) {

  // 部屋家事の取得
  // TODO roomIdを共通処理から取得する
  var roomId ="2";
  getRoomHomework(roomId).done(function(response){
    $scope.roomHomeworkList = response;
    console.log($scope.roomHomeworkList[0]);
    // 最新の情報で更新
    $scope.$apply();
  });

  // 編集ダイアログの表示
  $scope.callEditPage = function(index){

    $scope.workname = $scope.roomHomeworkList[index].home_work_name;
    $scope.baseHomeworkTime = $scope.roomHomeworkList[index].bese_home_work_time_hh;
    $scope.isVisible = $scope.roomHomeworkList[index].is_visible;
    $scope.roomHomeworkId = $scope.roomHomeworkList[index].room_home_work_id;

    if($scope.editPageDialog){

      $("#isDispTopListLabel").html($("#isVisible").prop('checked') ? "する" : "しない");
      $scope.editPageDialog.show();
    } else {
      ons.createDialog('editPage.html', {parentScope: $scope}).then(function(dialog) {
        $scope.editPageDialog = dialog;
        $("#isDispTopListLabel").html($("#isVisible").prop('checked') ? "する" : "しない");
        $scope.editPageDialog.show();
      });
    }
  }

  // 新規登録ダイアログの表示
  $scope.callInsertPage = function(index){

    $scope.workname = "";
    $scope.baseHomeworkTime = "1";
    $scope.isVisible = "true";
    $scope.roomHomeworkId = "";

    if($scope.editPageDialog){
      $("#isDispTopListLabel").html($("#isVisible").prop('checked') ? "する" : "しない");
      $scope.editPageDialog.show();
    } else {
      ons.createDialog('editPage.html', {parentScope: $scope}).then(function(dialog) {
        $scope.editPageDialog = dialog;
        $("#isDispTopListLabel").html($("#isVisible").prop('checked') ? "する" : "しない");
        $scope.editPageDialog.show();
      });
    }
  }

  // 表示可否ダイアログの切り替え
  $scope.clickVisible = function(){
    $scope.isVisible = $("#isVisible").prop('checked');
    $("#isDispTopListLabel").html($("#isVisible").prop('checked') ? "する" : "しない");
  }

  // 部屋家事の新規登録処理
  $scope.insertRoomHomework = function(isDispTopList){

    var record = [];
    var homework = {};

    homework['home_work_name'] = $("#workname").val();
    homework['base_home_work_time'] = Number($("#hourLabel").html());
    homework['room_home_work_id'] = $("#roomHomeworkId").val();
    homework['is_visible'] = $("#isVisible").prop('checked');
    record.push(homework);

    updateRoomHomework('1', '2', record).done(function(response){
      getRoomHomework(roomId).done(function(response){
        $scope.roomHomeworkList = response;
        $scope.$apply();
      });
    });

    $scope.editPageDialog.hide();
  }

  // 部屋家事の削除
  $scope.deleteRoomHomework = function(){

    var record = [];
    var homework = {};

    homework['room_home_work_id'] = $("#roomHomeworkId").val();
    record.push(homework);

    deleteRoomHomework('1', '2', record).done(function(response){
      getRoomHomework(roomId).done(function(response){
        $scope.roomHomeworkList = response;
        $scope.$apply();
      });
    });

    $scope.editPageDialog.hide();
  }

});

/*
招待ページコントローラ
*/
module.controller("invitePageController", function($scope) {

  //$scope.isDispTopList = null;

  // Show Dialog
  $scope.callInvitePage = function(obj){

    ons.createDialog('inviteModal.html', {parentScope: $scope}).then(function(dialog) {
        $scope.invitePageDialog = dialog;
        $scope.invitePageDialog.show();
      });
  }
});

/*
TEST APIページコントローラ
*/
module.controller("testAPIPageController", function($scope) {
  var user = {
      add: function(){
          window.console.log('test');

          window.console.log(monaca);
          monaca.cloud.User.register("me@example.com", "password", {age:21})
            .done(function(result)
            {
               window.console.log("Welcome, " + result.user._username);
               window.console.log("You are " + result.user.age + " years old.");
            }
            )
            .fail(function(err)
            {
               window.console.log("Err#" + err.code +": " + err.message);
            })
            .always(function(){
              window.console.log('aaa');
            });
            window.console.log('test2');
      },
  };

  $scope.user = user;

  // $scope.test = function()
  // {
  //     monaca.cloud.User.register("me@example.com", "password", {age:21})
  //           .done(function(result)
  //           {
  //              window.console.log("Welcome, " + result.user._username);
  //              window.console.log("You are " + result.user.age + " years old.");
  //           }
  //           )
  //           .fail(function(err)
  //           {
  //              window.console.log("Err#" + err.code +": " + err.message);
  //           })
  //           .always(function(){
  //             window.console.log('aaa');
  //           });
  //           window.console.log('test2');
  // };
  if (false == monaca.cloud.User.isAuthenticated()) {
      window.console.log('test33');
  } else {
      window.console.log('test4');
  }

  window.console.log('login:' + monaca.cloud.User.isAuthenticated());

  monaca.cloud.User.login("me@example.com", "password")
  .done(function(result){
     window.console.log("Hello again, " + result.user._username);
  })
  .fail(function(err)
  {
     window.console.log("Err#" + err.code +": " + err.message);
  })
  .always(function(){
      window.console.log('always login')
  });

var User = monaca.cloud.Collection("User"); // returns Collection object
window.console.log("id:"+User.id);
window.console.log("name:"+User.name);
window.console.log(User);

});
