
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
        
        $scope.testLogin = function(){
            
            userInfo =     {
                "user_id": 15,
                "email": "ayumu.hatakeyama@gmail.com",
                "user_name": "hatakeyama ayumu",
                "auth_type": 1,
                "auth_id": "105152352340203093268"
            }
            
            roomInfo =     {
                "room_id": 11,
                "room_name": "NEW ROOM",
                "user_id": 15,
                "room_access_key": "hogehogehoge",
                "is_owned": 1
            }
            
            alert("ユーザーID：" + userInfo.user_id + " 部屋ID：" + roomInfo.room_id + "でログインします");
            myNavigator.replacePage('layout.html');
            
        };

        /* Googleログイン */
        $scope.googleLogin = function(){
        
            googleAuth.callGoogle().done(function(data) {
                if(googleAuth.gmailID != ""){
                    // alert("IDは" + googleAuth.gmailID + "です");
                                        
                    // ユーザーの存在チェック
                    getUserInfo(googleAuth).done(function(response) {
                        
                        alert(JSON.stringify(response[0]));
                        userInfo = response[0];
                        
                        if(userInfo == undefined) {
                            // 新規ユーザー登録
                            insertNewUser(googleAuth).done(function(response) {
                                getUserInfo(googleAuth).done(function(response) {
                                    // alert(JSON.stringify(response[0]));
                                    userInfo = response[0];
                                    isSingIn = true;
                                    myNavigator.replacePage('layout.html');
                                });
                            });
                        } else {
                            isSingIn = true;
                            
                            // 部屋情報取得
                            getRoomsWithUser().done(function(response) {

                                if(1 < response.length){
                                    // 複数の部屋に所属している場合
                                    // TODO 部屋を選択する画面に遷移
                                    myNavigator.replacePage('layout.html');
                                } else {
                                   // 一つの部屋のみの場合
                                   roomInfo = response[0];
                                   // alert(JSON.stringify(roomInfo));
                                   myNavigator.replacePage('layout.html');
                                }
                            });                            
                        }
                    });
                    
                } else {
                    alert("Google認証情報を取得できていません");
                }
            });
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

   var roomId = roomInfo.room_id;
   
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
            $scope.beseHomeworkTimeHH = roomHomework.base_home_work_time_hh;
            $scope.homeworkTimeHH = roomHomework.base_home_work_time_hh;
            $scope.inputHomeWork.show();
                        
            // 家事登録
            $scope.inputHomeWork.register = function(roomHomeworkId){
                homeworkDate = moment().format('YYYY-MM-DD');
                updateHomeworkHist(roomHomeworkId, homeworkDate, $scope.homeworkTimeHH).done(function(response){
                    $scope.inputHomeWork.hide();
                    $scope.$apply();
                    getHomeWorkListWithRoomId(roomId).done(function(response){
                        $scope.roomHomeworkList = response;
                        
                        // 最新の情報で更新
                        $scope.$apply();
                    });
                });
            };
            
            $scope.inputHomeWork.plusHour = function(){
                $scope.homeworkTimeHH = plusHour($scope.homeworkTimeHH);
            };
            $scope.inputHomeWork.minusHour = function(){
                $scope.homeworkTimeHH = minusHour($scope.homeworkTimeHH);
            };

        });
   };
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
    var roomId =roomInfo.room_id;
    getRoomHomework(roomId).done(function(response){
        $scope.roomHomeworkList = response;
        console.log($scope.roomHomeworkList[0]);
        
        // 最新の情報で更新
        $scope.$apply();
    });

    // ダイアログ表示
    $scope.callEditPage = function(index){
            
        ons.createDialog('editPage.html', {parentScope: $scope}).then(function(dialog) {
            
            $scope.editPageDialog = dialog;

            $scope.editPageDialog.workname = "";
            $scope.editPageDialog.baseHomeworkTime = "1";
            $scope.editPageDialog.isVisible = "true";
            $scope.editPageDialog.roomHomeworkId = "";

            if(index !== undefined){
                $scope.editPageDialog.workname = $scope.roomHomeworkList[index].home_work_name;
                $scope.editPageDialog.baseHomeworkTime = $scope.roomHomeworkList[index].base_home_work_time_hh;
                $scope.editPageDialog.isVisible = $scope.roomHomeworkList[index].is_visible;
                $scope.editPageDialog.roomHomeworkId = $scope.roomHomeworkList[index].room_home_work_id;
            }

            $scope.editPageDialog.show();

            $scope.editPageDialog.plusHour = function(){
                $scope.editPageDialog.baseHomeworkTime = plusHour($scope.editPageDialog.baseHomeworkTime);
            };
            $scope.editPageDialog.minusHour = function(){
                $scope.editPageDialog.baseHomeworkTime = minusHour($scope.editPageDialog.baseHomeworkTime);
            };
            $scope.editPageDialog.clickVisible = function(){
                $scope.editPageDialog.isVisible = !$scope.editPageDialog.isVisible;
            }
            $scope.editPageDialog.insertRoomHomework = function(){
            
                var record = [];
                var homework = {};
                
                alert($scope.editPageDialog.workname);
                
                homework['home_work_name'] = $scope.editPageDialog.workname;
                homework['base_home_work_time'] = Number($scope.editPageDialog.baseHomeworkTime);
                homework['room_home_work_id'] = $scope.editPageDialog.roomHomeworkId;
                homework['is_visible'] = $scope.editPageDialog.isVisible;
                record.push(homework);
                
                updateRoomHomework(userInfo.user_id, roomInfo.room_id, record).done(function(response){
                    getRoomHomework(roomId).done(function(response){
                        $scope.roomHomeworkList = response;
                        $scope.$apply();
                    });
                });
                
                $scope.editPageDialog.hide();
            }
            // 部屋家事の削除
            $scope.editPageDialog.deleteRoomHomework = function(){
                
                ons.notification.confirm({message: '削除してよろしいですか？'}).then(function(result) {
                    
                    if(result === 0){
                        return false;
                    }
                    
                    var homework = {};
                    homework['room_home_work_id'] = $scope.editPageDialog.roomHomeworkId;
                    var record = [];
                    record.push(homework);
                    
                    deleteRoomHomework(record).done(function(response){
                        getRoomHomework(roomId).done(function(response){
                            $scope.roomHomeworkList = response;
                            $scope.$apply();
                            $scope.editPageDialog.hide();
                        });
                    });
                });
            }
        });
    }
});

    /*
    招待ページコントローラ
    */
    module.controller("invitePageController", function($scope) {
        
      // Show Dialog
      $scope.callInvitePage = function(obj){
    
        ons.createDialog('inviteModal.html', {parentScope: $scope}).then(function(dialog) {
            $scope.invitePageDialog = dialog;
            $scope.invitePageDialog.show();
          });
      }
    });
