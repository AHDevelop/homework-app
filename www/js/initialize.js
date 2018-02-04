
/*
* Onsen UIの注入
*/
var module = ons.bootstrap('myApp', ['onsen']);
  
/*
* サイドメニューコントローラーを初期化
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
* メニュー内のイベントコントローラー
*/
module.controller('menuPageController', function($scope) {

    $scope.gotoTop = function(){
        $scope.splitter.load('top.html');
    };

    $scope.gotoHomeworkHist = function(){
        $scope.splitter.load('homework_hist.html');
    };

    $scope.gotoGraph = function(){
        $scope.splitter.load('graph.html');
    };
    
    $scope.gotoAddHomework = function(){
        $scope.splitter.load('add_homework.html');
    };
    
    $scope.gotoMember = function(){
        $scope.splitter.load('member.html');
    };
    
    $scope.gotoSetting = function(){
        $scope.splitter.load('setting.html');
    };

    // サインアウト
    $scope.signout = function(){
        isSingIn = false;
        googleAuth.disconnectUser().done(function(data) {
            localStorage.removeItem('roomInfo.room_id');
            myNavigator.replacePage('login.html');
        });
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
        };
        
        roomInfo =     {
            "room_id": 11,
            "room_name": "NEW ROOM",
            "user_id": 15,
            "room_number": "0313",
            "is_owned": 1
        };
        
        alert("ユーザーID：" + userInfo.user_id + " 部屋ID：" + roomInfo.room_id + "でログインします");
        myNavigator.replacePage('layout.html');
        
    };

    /* Googleログイン */
    $scope.googleLogin = function(){
        
        showLoading();

        googleAuth.callGoogle().done(function(data) {
            if(googleAuth.gmailID !== ""){
                // alert("IDは" + googleAuth.gmailID + "です");
                                    
                // ユーザーの存在チェック
                getUserInfo(googleAuth).done(function(response) {
                    
                    //alert(JSON.stringify(response[0]));
                    userInfo = response.results[0];
                    
                    if(userInfo === undefined) {
                        // 新規ユーザー登録
                        insertNewUser(googleAuth).done(function(response) {
                            
                            // 登録したユーザーを再取得
                            getUserInfo(googleAuth).done(function(response) {
                                // alert(JSON.stringify(response[0]));
                                userInfo = response.results[0];
                                isSingIn = true;
                                myNavigator.replacePage('layout.html');
                            }).always(function() {
                                hideLoading();
                            });                        
                        });
                    } else {
                        isSingIn = true;
                        
                        // 部屋情報取得
                        getRoomsWithUser().done(function(response) {
                            
                            // 前回の部屋情報があれば引き継ぎ
                            room_id = localStorage.getItem("roomInfo.room_id");
                            
                            if(room_id === undefined){
                                    localStorage.setItem('roomInfo.room_id', response.results[0].room_id);
                                    roomInfo = response.results[0];
                            } else {
                                // 前回情報がある場合は初期設定の部屋を設定する
                                if(1 < response.results.length){
                                    response.results.forEach(function(roomObj){
                                        if(roomObj.room_id == room_id){
                                            roomInfo = roomObj;
                                        }
                                    });
                                } else {
                                    roomInfo = response.results[0];
                                }
                            }
                            myNavigator.replacePage('layout.html');
                        }).always(function() {
                            hideLoading();
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
        // ons.createDialog('editPage.html', {parentScope: $scope}).then(function(dialog) {
        //     $scope.inputHomeWork = dialog;
        //     $scope.inputHomeWork.show();
        // });
        // 
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
        $scope.roomHomeworkList = response.results;

        // 最新の情報で更新
        $scope.$apply();
    }).always(function() {
        hideLoading();
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

                $scope.inputHomeWork.hide();
                showLoading();
                homeworkDate = moment().format('YYYY-MM-DD');
                
                registerHomeworkHist(roomHomeworkId, homeworkDate, $scope.homeworkTimeHH).done(function(response){
                    $scope.$apply();
                    getHomeWorkListWithRoomId(roomId).done(function(response){
                        $scope.roomHomeworkList = response.results;
                        
                        // 最新の情報で更新
                        $scope.$apply();
                    }).always(function() {
                        hideLoading();
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

    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function(event) {
        showLoading();
    });

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
        $scope.roomHomeworkHistList = response.results;
        
        // 最新の情報で更新
        $scope.$apply();
    }).always(function() {
        hideLoading();
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
                
                // 画面読み込み開始時の処理
                $scope.inputHomeWork.hide();
                showLoading();

                updateHomeworkHist($scope.homeworkHistId, $scope.homeworkTimeHH).done(function(response){
                    getHomeworkHist(roomId).done(function(response){
                        $scope.roomHomeworkHistList = response.results;
                        
                        // 最新の情報で更新
                        $scope.$apply();
                    }).always(function() {
                        hideLoading();
                    });
                });
            };

            // 家事削除
            $scope.inputHomeWork.delete = function(){

                // 画面読み込み開始時の処理
                $scope.inputHomeWork.hide();
                showLoading();

                deleteHomeworkHist($scope.homeworkHistId).done(function(response){
                    getHomeworkHist(roomId).done(function(response){
                        $scope.roomHomeworkHistList = response.results;
                        
                        // 最新の情報で更新
                        $scope.$apply();
                    }).always(function() {
                        hideLoading();
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
    
    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function(event) {
        showLoading();
    });
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
        
        // 画面読み込み開始時の処理
        showLoading();
        
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

        // 画面読み込み開始時の処理
        showLoading();
        
        // グラフの再取得処理
        updateGraph($scope.fromDate, $scope.toDate);
    };
    
    // グラフの再取得処理
    updateGraph($scope.fromDate, $scope.toDate);
    
    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function(event) {
        showLoading();
    });
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
        
        response.results.forEach(function(histObj){
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
    }).always(function() {
        hideLoading();
    });
    
    // 家事別時間集計取得
    getHistSummaryByHomework(fromDate, toDate).done(function(response){
        
        //API返却値をグラフモジュール用に整形
        var data = [];
        var labels = [];
        
        response.results.forEach(function(histObj){
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
    }).always(function() {
        hideLoading();
    });
};
    
/*
* 家事追加、編集ページコントローラ
*/
module.controller("addHomeworkPageController", function($scope) {

    // 部屋家事の取得
    var roomId =roomInfo.room_id;
    getRoomHomework(roomId).done(function(response){
        $scope.roomHomeworkList = response.results;        
        // 最新の情報で更新
        $scope.$apply();
    }).always(function() {
        hideLoading();
    });

    // ダイアログ表示
    $scope.callEditPage = function(index){
            
        ons.createDialog('editPage.html', {parentScope: $scope}).then(function(dialog) {
            
            $scope.editPageDialog = dialog;

            $scope.editPageDialog.workname = "";
            $scope.editPageDialog.baseHomeworkTime = "1.0";
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
                alert($scope.editPageDialog.baseHomeworkTime);
                $scope.editPageDialog.baseHomeworkTime = plusHour($scope.editPageDialog.baseHomeworkTime);
            };
            $scope.editPageDialog.minusHour = function(){
                $scope.editPageDialog.baseHomeworkTime = minusHour($scope.editPageDialog.baseHomeworkTime);
            };
            $scope.editPageDialog.clickVisible = function(){
                $scope.editPageDialog.isVisible = !$scope.editPageDialog.isVisible;
            };
            $scope.editPageDialog.insertRoomHomework = function(){
            
                var record = [];
                var homework = {};
                
                homework['home_work_name'] = $scope.editPageDialog.workname;
                homework['base_home_work_time'] = Number($scope.editPageDialog.baseHomeworkTime);
                homework['room_home_work_id'] = $scope.editPageDialog.roomHomeworkId;
                homework['is_visible'] = $scope.editPageDialog.isVisible;
                record.push(homework);
                
                // 画面読み込み開始時の処理
                showLoading();
                
                updateRoomHomework(userInfo.user_id, roomInfo.room_id, record).done(function(response){
                    getRoomHomework(roomId).done(function(response){
                        $scope.roomHomeworkList = response.results;
                        $scope.$apply();
                    }).always(function() {
                        hideLoading();
                    });
                });
                
                $scope.editPageDialog.hide();
            };
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
                    
                    // 画面読み込み開始時の処理
                    $scope.editPageDialog.hide();
                    showLoading();
                    
                    deleteRoomHomework(record).done(function(response){
                        getRoomHomework(roomId).done(function(response){
                            $scope.roomHomeworkList = response.results;
                            $scope.$apply();
                        }).always(function() {
                            hideLoading();
                        });
                    });
                });
            };
        });
    };
    
    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function(event) {
        showLoading();
    });
});

/*
* メンバー管理ページコントローラ
*/
module.controller("memberPageController", function($scope) {
    
    // メンバー一覧取得
    getRoomUserIncludeOwner().done(function(response){
        $scope.roomMemberList = response.results;        
        // 最新の情報で更新
        $scope.$apply();
    }).always(function() {
        hideLoading();
    });
    
    // 部屋追加
    $scope.callAddRoom = function(obj){
        
        ons.createDialog('addRoom.html', {parentScope: $scope}).then(function(dialog) {

            $scope.addRoomDialog = dialog;
            $scope.addRoomDialog.roomName = "";
            $scope.addRoomDialog.roomNumber = "";

            $scope.addRoomDialog.addRoom = function(){
                
                // 画面読み込み開始時の処理
                $scope.addRoomDialog.hide();                
                showLoading();
                
                addRoom($scope.addRoomDialog.roomName, $scope.addRoomDialog.roomNumber).done(function(response){
                    
                    roomInfo.room_id = response.results;
                    
                    // メンバー一覧取得
                    getRoomUserIncludeOwner().done(function(response){
                        $scope.roomMemberList = response.results;        
                        // 最新の情報で更新
                        $scope.$apply();
                    }).always(function() {
                        hideLoading();
                    });
                });
            };
            
            $scope.addRoomDialog.show();
        });
    };
    
    // 部屋ユーザー削除
    $scope.removeMember = function(index){
        
        // IDから該当するユーザー情報を特定する
        var memberObj = $scope.roomMemberList[index];
        
        ons.notification.confirm({message: memberObj.user_name + 'さんを部屋から除外してよろしいですか？'}).then(function(result) {
                    
            if(result === 0){
                return false;
            }
            
            // 画面読み込み開始時の処理
            showLoading();
            
            removeMember(memberObj.user_id).done(function(response){
                // メンバー一覧取得
                getRoomUserIncludeOwner().done(function(response){
                    $scope.roomMemberList = response.results;        
                    // 最新の情報で更新
                    $scope.$apply();
                }).always(function() {
                    hideLoading();
                });
            });
        });
    };
    
    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function(event) {
        showLoading();
    });
});

/*
* 設定ページコントローラ
*/
module.controller("settingPageController", function($scope) {
    
    $scope.userName = userInfo.user_name;
    $scope.roomName = roomInfo.room_name;
    $scope.roomNo = roomInfo.room_number;
    $scope.selectRoom = {};
    
    // 部屋一覧取得
    getRoomsWithUser().done(function(response){
        
        $scope.roomList = response.results;
        
        // 現在の部屋を設定する
        response.results.forEach(function(roomObj){
            if(roomObj["room_id"] == roomInfo.room_id){
                $scope.selectRoom =  roomObj;
            }
        });
        // 最新の情報で更新
        $scope.$apply();
    }).always(function() {
        hideLoading();
    });
                
    // 保存
    $scope.register = function(obj){
        
        // 部屋設定更新
        updateRoom($scope.roomName, $scope.roomNo).done(function(response){

            roomInfo.room_name = response.results["room_name"];
            roomInfo.room_number = response.results["room_number"];
            $scope.roomName = roomInfo.room_name;
            $scope.roomNo = roomInfo.room_number;
            roomInfo.room_id = $scope.selectRoom["room_id"];
            
            // 画面読み込み開始時の処理
            showLoading();
            
            // ユーザー更新
            updateUser($scope.userName).done(function(response){

                userInfo.user_name = response.results["user_name"];
                $scope.userName = userInfo.user_name;
    
                // 最新の情報で更新
                $scope.$apply();
           }).always(function() {
                hideLoading();
            });
        });
    };
    
    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function(event) {
        showLoading();
    });
});
