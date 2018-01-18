
/*
Onsen UIの注入
*/
var module = ons.bootstrap('myApp', ['onsen']);
angular.module("app", ["angular-loading-bar"]);

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
    
    // テストログイン
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
            "room_number": "0313",
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
    
       // テストダイアログ表示
    $scope.callDialog = function(index){
        // 家事名と標準時間を設定した状態でダイアログを起動する
        ons.createDialog('addRoom.html', {parentScope: $scope}).then(function(dialog) {
            $scope.inputHomeWork = dialog;
            $scope.inputHomeWork.show();
        });
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
            $scope.isEdit = false;
            $scope.inputHomeWork.show();
                        
            // 家事登録
            $scope.inputHomeWork.register = function(roomHomeworkId){
                homeworkDate = moment().format('YYYY-MM-DD');
                registerHomeworkHist(roomHomeworkId, homeworkDate, $scope.homeworkTimeHH).done(function(response){
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
* 家事履歴ページコントローラー
*/
module.controller("homeworkHistPageController", function($scope) {
    
    // 現在日時の設定
    $scope.nowDate = moment().format('YYYY年MM月DD日');

    // 家事履歴の取得
    var roomId =roomInfo.room_id;
    getHomeworkHist(roomId).done(function(response){
        $scope.roomHomeworkHistList = response;
        
        // 最新の情報で更新
        $scope.$apply();
    });
    
    // 家事時間入力ダイアログを表示
    $scope.callEditPage = function(index){

        // IDから該当する家事を特定する
        var roomHomework = $scope.roomHomeworkHistList[index];
                
        // 家事名と家事時間を設定した状態でダイアログを起動する
        ons.createDialog('inputHomeWork.html', {parentScope: $scope}).then(function(dialog) {
            $scope.inputHomeWork = dialog;
            $scope.homeworkName = roomHomework.home_work_name;
            $scope.homeworkHistId = roomHomework.home_work_hist_id;
            $scope.beseHomeworkTimeHH = roomHomework.home_work_time_hh;
            $scope.homeworkTimeHH = roomHomework.home_work_time_hh;
            $scope.isEdit = true;
            $scope.inputHomeWork.show();
                        
            // 家事更新
            $scope.inputHomeWork.update = function(){
                updateHomeworkHist($scope.homeworkHistId, $scope.homeworkTimeHH).done(function(response){
                    $scope.inputHomeWork.hide();
                    $scope.$apply();
                    getHomeworkHist(roomId).done(function(response){
                        $scope.roomHomeworkHistList = response;
                        
                        // 最新の情報で更新
                        $scope.$apply();
                    });
                });
            };

            // 家事削除
            $scope.inputHomeWork.delete = function(){
                deleteHomeworkHist($scope.homeworkHistId).done(function(response){
                    $scope.inputHomeWork.hide();
                    $scope.$apply();
                    getHomeworkHist(roomId).done(function(response){
                        $scope.roomHomeworkHistList = response;
                        
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

    $scope.fromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    $scope.toDate = moment().format('YYYY-MM-DD');
    
    $scope.callJustMonth = function(){
        $scope.fromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        $scope.toDate = moment().format('YYYY-MM-DD');
        
        $(".monthBtn").addClass("off").prop('disabled', true);
        $(".yesterdayBtn").removeClass("off").prop('disabled', false);
        $(".todayBtn").removeClass("off").prop('disabled', false);
        
        // グラフの再取得処理
        updateGraph($scope.fromDate, $scope.toDate);
    };

    $scope.callYesterDay = function(){
        var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
        $scope.fromDate = yesterday;
        $scope.toDate = yesterday;

        $(".monthBtn").removeClass("off").prop('disabled', false);
        $(".yesterdayBtn").addClass("off").prop('disabled', true);
        $(".todayBtn").removeClass("off").prop('disabled', false);

        // グラフの再取得処理
        updateGraph($scope.fromDate, $scope.toDate);
    };

    $scope.callToday = function(){
        var today = moment().format('YYYY-MM-DD');
        $scope.fromDate = today;
        $scope.toDate = today;

        $(".monthBtn").removeClass("off").prop('disabled', false);
        $(".yesterdayBtn").removeClass("off").prop('disabled', false);
        $(".todayBtn").addClass("off").prop('disabled', true);

        // グラフの再取得処理
        updateGraph($scope.fromDate, $scope.toDate);
    };
    
    // グラフの再取得処理
    updateGraph($scope.fromDate, $scope.toDate);
});

/*
* グラフの再取得処理
*/
function updateGraph(fromDate, toDate){
    
    // ユーザー別家事集計取得
    getHistSummaryByUser(fromDate, toDate).done(function(response){
        
        //API返却値をグラフモジュール用に整形
        var data = [];
        var labels = [];
        
        response.forEach(function(histObj){
            data.push(histObj["home_work_time_sum"]);
            labels.push(histObj["user_name"]);
        });

        var config = {
            type: 'pie',
            data: {
            datasets: [{
                data: data,
                backgroundColor: backgroundColorList
            }],
                labels: labels
            },
            options: {
                responsive: true
            }
        };
            
        var ctx = document.getElementById("user_chart_area").getContext("2d");
        window.userChart = new Chart(ctx, config);
    });
    
    // 家事別時間集計取得
    getHistSummaryByHomework(fromDate, toDate).done(function(response){
        
        //API返却値をグラフモジュール用に整形
        var data = [];
        var labels = [];
        
        response.forEach(function(histObj){
            data.push(histObj["home_work_time_sum"]);
            labels.push(histObj["home_work_name"]);
        });

        var config = {
            type: 'pie',
            data: {
            datasets: [{
                data: data,
                backgroundColor: backgroundColorList
            }],
                labels: labels
            },
            options: {
                responsive: true
            }
        };
            
        var ctx = document.getElementById("homework_chart_area").getContext("2d");
        window.homeworkChart = new Chart(ctx, config);
    });
};
    
/*
* 家事追加、編集ページコントローラ
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
* メンバー管理ページコントローラ
*/
module.controller("memberPageController", function($scope) {
    
    // メンバー一覧取得
    getRoomUserIncludeOwner().done(function(response){
        $scope.roomMemberList = response;        
        // 最新の情報で更新
        $scope.$apply();
    });
    
    // 部屋追加
    $scope.callAddRoom = function(obj){
        
        ons.createDialog('addRoom.html', {parentScope: $scope}).then(function(dialog) {

            $scope.addRoomDialog = dialog;
            $scope.addRoomDialog.roomName = "";
            $scope.addRoomDialog.roomNumber = "";

            $scope.addRoomDialog.addRoom = function(){
                
                addRoom($scope.addRoomDialog.roomName, $scope.addRoomDialog.roomNumber).done(function(response){
                    
                    $scope.addRoomDialog.hide();                
                    roomInfo.room_id = response;
                    
                    // メンバー一覧取得
                    getRoomUserIncludeOwner().done(function(response){
                        $scope.roomMemberList = response;        
                        // 最新の情報で更新
                        $scope.$apply();
                    });
                });
            }
            
            $scope.addRoomDialog.show();
        });
    }
    
    // 部屋ユーザー削除
    $scope.removeMember = function(index){
        
        // IDから該当するユーザー情報を特定する
        var memberObj = $scope.roomMemberList[index];
        
        ons.notification.confirm({message: memberObj.user_name + 'さんを部屋から除外してよろしいですか？'}).then(function(result) {
                    
            if(result === 0){
                return false;
            }
            
            removeMember(memberObj.user_id).done(function(response){
                // メンバー一覧取得
                getRoomUserIncludeOwner().done(function(response){
                    $scope.roomMemberList = response;        
                    // 最新の情報で更新
                    $scope.$apply();
                });
            });
        });
    }
});

/*
設定ページコントローラ
*/
module.controller("settingPageController", function($scope) {
    
    $scope.userName = userInfo.user_name;
    $scope.roomName = roomInfo.room_name;
    $scope.roomNo = roomInfo.room_number;
                
    // 保存
    $scope.register = function(obj){
        
        alert("call register")
        // 部屋設定更新
        updateRoom($scope.roomName, $scope.roomNo).done(function(response){

            roomInfo.room_name = response["room_name"];
            roomInfo.room_number = response["room_number"];
            $scope.roomName = roomInfo.room_name;
            $scope.roomNo = roomInfo.room_number;
            
            
            // ユーザー更新
            updateUser($scope.userName).done(function(response){

                userInfo.user_name = response["user_name"];
                $scope.userName = userInfo.user_name;
    
                // 最新の情報で更新
                $scope.$apply();
            });
        });
    }
});
