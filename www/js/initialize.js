
/*
* Onsen UIの注入
*/
var module = ons.bootstrap('myApp', ['onsen']);

/*
* サイドメニューコントローラーを初期化
*/
module.controller('SplitterController', function($scope) {

    this.load = function(page) {
      mySplitter.content.load(page)
        .then(function() {
          mySplitter.left.close();
        });
    };
    $scope.gotoUserInfo = function(){
        $scope.splitter.load('user_info.html');
    };

    // ログインユーザーのアイコン画像を設定
    $scope.iconurl = googleAuth.gmailPicture;
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
            localStorage.removeItem('googleAuth.access_token');
            myNavigator.replacePage('login.html');
        });
    };
});

/*
サインインページコントローラ
*/
module.controller("signinPageController", function($scope) {

    var access_token = localStorage.getItem('googleAuth.access_token');

    // 既存ユーザーの場合はログイン処理に進む
    if(access_token !== null){
        googleAuth.getDataProfile(access_token).done(function(data) {
            secondLogin();
        });
    };

    /* Googleログイン */
    $scope.googleLogin = login;
    
    /* 二回目以降のログイン処理 */
    function secondLogin(){

        showLoading();
      
        if(googleAuth.gmailID === ""){
            alert("Google認証情報を取得できていません");
            return false;
        }
        // ユーザーの存在チェック&Token更新
        getUserInfo(googleAuth).done(function(response) {
            
            userInfo = response.results[0];
            
            // 既存ユーザー情報あり
            isSingIn = true;
            
            // 部屋情報取得
            getRoomsWithUser().done(function(response) {
                
                // 前回の部屋情報があれば引き継ぎ
                room_id = localStorage.getItem("roomInfo.room_id");
                
                if(room_id === null){
                    roomInfo = response.results[0];
                    localStorage.setItem('roomInfo.room_id', roomInfo.room_id);
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
        });
    }
    
    /*
    * 初回ログイン処理
    */
    function login(){
        
        showLoading();

        googleAuth.callGoogle().done(function(data) {
            if(googleAuth.gmailID !== ""){
                                    
                // ユーザーの存在チェック&Token更新
                getUserInfo(googleAuth).done(function(response) {
                    
                    userInfo = response.results[0];
                    
                    if(userInfo === undefined) {
                        // 新規ユーザー登録
                        insertNewUser(googleAuth).done(function(response) {
                            
                            // 登録したユーザーと部屋情報が返却される
                            registerInfo = response.results;
                            
                            roomInfo.room_id = registerInfo["room_id"];
                            roomInfo.room_name = registerInfo["room_name"];
                            roomInfo.room_number = registerInfo["room_number"];
                            roomInfo.user_id = registerInfo["user_id"];
                            roomInfo.is_owned = true;
                            localStorage.setItem('roomInfo.room_id', roomInfo.room_id);
                            
                            userInfo = {};
                            userInfo.user_id =  registerInfo["user_id"];
                            userInfo.email =  registerInfo["email"];
                            userInfo.user_name =  registerInfo["user_name"];
                            userInfo.auth_type =  registerInfo["auth_type"];
                            userInfo.auth_id =  registerInfo["auth_id"];
                            userInfo.app_token = registerInfo["app_token"];
                            
                            isSingIn = true;

                            myNavigator.replacePage('layout.html');
                        }).always(function() {
                            hideLoading();
                        });
                        
                    } else {
                        // 既存ユーザー情報あり
                        isSingIn = true;
                        
                        // 部屋情報取得
                        getRoomsWithUser().done(function(response) {
                            
                            // 前回の部屋情報があれば引き継ぎ
                            room_id = localStorage.getItem("roomInfo.room_id");
                            
                            if(room_id === null){
                                roomInfo = response.results[0];
                                localStorage.setItem('roomInfo.room_id', roomInfo.room_id);
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
});

/*
* TOPページコントローラ
*/
module.controller("topPageController", function($scope) {

   // 現在日時の設定
   $scope.nowDate = moment().format('YYYY年MM月DD日');
   $scope.header = {};
   $scope.header.title = "家事入力";

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
    $scope.header = {};
    $scope.header.title = "家事履歴";

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
    
    $scope.header = {};
    $scope.header.title = "家事別集計";
    
    $scope.changeGraphType = function(btnName){
        if( btnName === 'chatByHomeworks'){
            $scope.header.title = "家事別集計";
        } else {
            $scope.header.title = "ユーザー別家事集計";
        }
    }

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
                backgroundColor: palette('tol', data.length).map(function(hex) {
                    return '#' + hex;
                })
            }],
                labels: labels
            },
            options: {
                responsive: true
            }
        };
            
        var ctx = document.getElementById("user_chart_area").getContext("2d");

        if(data.length < 1){
          document.getElementById("user_chart_area").style.display="none";
          document.getElementById("chatByUsers_nonData").style.display="block";
        } else {
          document.getElementById("chatByUsers_nonData").style.display="none";
          document.getElementById("user_chart_area").style.display="block";
          window.homeworkChart = new Chart(ctx, config);
        }
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
                backgroundColor: palette('tol', data.length).map(function(hex) {
                    return '#' + hex;
                })
            }],
                labels: labels
            },
            options: {
                responsive: true
            }
        };
            
        var ctx = document.getElementById("homework_chart_area").getContext("2d");

        if(data.length < 1){
          document.getElementById("homework_chart_area").style.display="none";
          document.getElementById("chatByHomeworks_nonData").style.display="block";
        } else {
          document.getElementById("chatByHomeworks_nonData").style.display="none";
          document.getElementById("homework_chart_area").style.display="block";
          window.homeworkChart = new Chart(ctx, config);
        }
    }).always(function() {
        hideLoading();
    });
};
    
/*
* 家事追加、編集ページコントローラ
*/
module.controller("addHomeworkPageController", function($scope) {
    
    $scope.header = {};
    $scope.header.title = "家事設定";

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
* メンバ管理ページコントローラ
*/
module.controller("memberPageController", function($scope) {
    
    $scope.header = {};
    $scope.header.title = "メンバー管理";
    
    // ログイン中のユーザーが部屋のオーナーかどうか
    $scope.roomInfo = {};
    $scope.roomInfo.is_owned = roomInfo.is_owned;
    
    // メンバー一覧取得
    getRoomUserIncludeOwner().done(function(response){
        $scope.roomMemberList = response.results;        
        // 最新の情報で更新
        $scope.$apply();
    }).always(function() {
        hideLoading();
    });
    
    // 部屋ユーザー削除
    $scope.removeMember = function(index){
        
        // IDから該当するユーザー情報を特定する
        var memberObj = $scope.roomMemberList[index];
        
        ons.notification.confirm(
          {
            message: memberObj.user_name + 'さんを部屋から除外してよろしいですか？',
            buttonLabels:["いいえ","はい"],
            title:"確認",
          }).then(function(result) {
                    
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
    
    $scope.header = {};
    $scope.header.title = "設定";

    $scope.userName = userInfo.user_name;
    $scope.roomName = roomInfo.room_name;
    $scope.roomNo = roomInfo.room_number;
    $scope.is_owned = roomInfo.is_owned;
    $scope.room_id = roomInfo.room_id;
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
                    
                    if(response.results === null){
                        hideLoading();
                        return;
                    }

                    // 追加後の部屋一覧を取得する
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
                });
            };
            
            $scope.addRoomDialog.show();
        });
    };
                
    // 保存
    $scope.register = function(obj){
        
        // 画面読み込み開始時の処理
        showLoading();

        if($scope.is_owned != 1){
            
            // 部屋オーナー以外は対象の部屋を切り替えて処理終了
            roomInfo.roomName = $scope.roomName;
            roomInfo.roomNo = $scope.roomNo;
            roomInfo.room_id = $scope.room_id;
            roomInfo.is_owned = $scope.is_owned;
            localStorage.setItem('roomInfo.room_id', roomInfo.room_id);

            ons.notification.alert({
                    title: "",
                    messageHTML: "部屋を切り替えました。",
                }
            );
            
            hideLoading();
            return;
        }

        // オーナーの場合のみ部屋の更新処理に進む

        // 部屋設定更新
        roomInfo.room_id = $scope.room_id;
        roomInfo.is_owned = $scope.is_owned;
        localStorage.setItem('roomInfo.room_id', roomInfo.room_id);
        updateRoom($scope.roomName, $scope.roomNo).done(function(response){
            
            roomInfo.room_name = response.results.room_name;
            roomInfo.room_number = response.results.room_number;
            roomInfo.room_id = response.results.room_id;

            $scope.roomName = roomInfo.room_name;
            $scope.roomNo = roomInfo.room_number;
            
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
        });
    };
    
    // 部屋切替
    $scope.changeRoom = function(obj){
                
        // 現在の部屋を設定する
        $scope.roomName = $scope.selectRoom.room_name;
        $scope.roomNo = $scope.selectRoom.room_number;
        $scope.room_id = $scope.selectRoom.room_id;
        $scope.is_owned = $scope.selectRoom.is_owned;

        localStorage.setItem('roomInfo.room_id', $scope.room_id);
        
        $scope.$apply();
    };
    
    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function(event) {
        showLoading();
    });
});

/*
* ユーザー情報ページコントローラ
*/
module.controller("userInfoPageController", function($scope) {
    
    $scope.header = {};
    $scope.header.title = "ユーザー情報";

    $scope.userName = userInfo.user_name;

    // 保存
    $scope.register = function(obj){
        
        // 画面読み込み開始時の処理
        showLoading();

        // ユーザー更新
        updateUser($scope.userName).done(function(response){

            userInfo.user_name = response.results["user_name"];
            $scope.userName = userInfo.user_name;
            localStorage.setItem('roomInfo.room_id', roomInfo.room_id);
            
        }).always(function() {
            if(roomInfo.is_owned != 1){
                hideLoading();
            }
        });
    };
});
