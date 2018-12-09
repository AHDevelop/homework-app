
/*
* Onsen UIの注入
*/
var module = ons.bootstrap('myApp', ['onsen', 'swipe']);

ons.ready(function () {
    ons.setDefaultDeviceBackButtonListener(function () {
        hideLoading();;
    });
});

/*
* URLからのアクセス時に呼び出される
*/
function handleOpenURL(url) {
    setTimeout(function () {
        var strUrl = url;
        inviteInfo.invite_room_id = getParam("roomId", strUrl);
        inviteInfo.invite_from_user_id = getParam("userId", strUrl);
        inviteInfo.param = getParam("param", strUrl);
    }, 0);
};

/*
* サイドメニューコントローラーを初期化
*/
module.controller('SplitterController', function ($scope) {

    this.load = function (page) {
        mySplitter.content.load(page)
            .then(function () {
                mySplitter.left.close();
            });
    };
    $scope.gotoUserInfo = function () {
        $scope.splitter.load('user_info.html');
    };

    // ログインユーザーのアイコン画像を設定
    $scope.iconurl = googleAuth.gmailPicture;
    $scope.userName = userInfo.user_name;
    $scope.roomName = roomInfo.room_name;
});

/*
* メニュー内のイベントコントローラー
*/
module.controller('menuPageController', function ($scope) {

    $scope.gotoTop = function () {
        $scope.splitter.load('top.html');
    };

    $scope.gotoHomeworkHist = function () {
        $scope.splitter.load('homework_hist.html');
    };

    $scope.gotoGraph = function () {
        $scope.splitter.load('graph.html');
    };

    $scope.gotoAddHomework = function () {
        $scope.splitter.load('add_homework.html');
    };

    $scope.gotoMember = function () {
        $scope.splitter.load('member.html');
    };

    $scope.gotoSetting = function () {
        $scope.splitter.load('setting.html');
    };

    // サインアウト
    $scope.signout = function () {
        isSingIn = false;
        var serial = localStorage.getItem('homework_user.serial');
        if (serial !== null) {
            localStorage.removeItem('roomInfo.room_id');
            localStorage.removeItem('homework_user.serial');
            myNavigator.replacePage('login.html');
        } else {
            googleAuth.disconnectUser().done(function (data) {
                localStorage.removeItem('roomInfo.room_id');
                localStorage.removeItem('googleAuth.access_token');

                myNavigator.replacePage('login.html');
            });
        }
    };
});

/*
* サインインページコントローラ
*/
module.controller("signinPageController", function ($scope) {

    $scope.userName = "";

    // Googleのアクセストークン
    var access_token = localStorage.getItem('googleAuth.access_token');
    var homework_serial = localStorage.getItem('homework_user.serial');

    /*
    * Googleログイン処理
    */
    $scope.callGoogleLoginBtn = function () {
        firstLoginWithGoogle();
    };

    /*
    * ほーむわーくユーザーログイン処理
    */
    $scope.callHomeworkLoginBtn = function () {

        if ($scope.userName == "") {
            ons.notification.alert({
                title: "",
                messageHTML: "ニックネームを入力してください。",
            }
            );
            return false;
        }

        firstLoginWithHomework();
    };

    // 過去のログイン履歴をチェック
    if (access_token === null && homework_serial === null) {
        // 過去のログイン履歴が無いとログイン方法を特定できないので自動ログインはしない
        return false;
    };

    // 以下、自動ログインの流れ
    // 過去のログイン履歴を取得する
    if (access_token !== null) {
        googleAuth.getDataProfile(access_token).done(function (data) {
            secondLoginWithGoogle();
        });
    } else if (homework_serial !== null) {
        setTimeout(function () {
            // 画面が描画されるまで一瞬待つ
            showLoading();
            secondLoginWithHomework(homework_serial);
        }, 500);
    }

    /*
    * 二回目以降のログイン　Googleユーザー
    */
    function secondLoginWithGoogle() {

        showLoading();

        if (googleAuth.gmailID === "") {
            alert("Google認証情報を取得できません");
            return false;
        }

        // ユーザーの存在チェック&Token更新
        getUserInfo(googleAuth).done(function (response) {

            // 既存ユーザー情報あり
            userInfo = response.results[0];
            isSingIn = true;

            if (inviteInfo.invite_room_id != undefined) {
                // 招待された部屋を追加
                setInviteRoom();
            } else {
                // 部屋を設定してTOP画面を表示する
                setDefaultRoom();
            }
        });

    }

    /*
    * 二回目以降のログイン　Homeworkユーザー
    */
    function secondLoginWithHomework(homework_serial) {

        showLoading();

        // ユーザーの存在チェック　トークン更新
        getUserInfoBySerial(homework_serial).done(function (response) {

            // 既存ユーザー情報あり
            userInfo = response.results[0];
            isSingIn = true;

            if (inviteInfo.invite_room_id != undefined) {
                // 招待された部屋を追加
                setInviteRoom();
            } else {
                // 部屋を設定してTOP画面を表示する
                setDefaultRoom();
            }
        });
    }

    /*
    * Google認証での初回ログイン処理
    */
    function firstLoginWithGoogle() {

        showLoading();

        // GoogleのIDを取得
        googleAuth.callGoogle().done(function (data) {

            if (googleAuth.gmailID !== "") {

                // ユーザーの存在チェック&Token更新
                getUserInfo(googleAuth).done(function (response) {

                    userInfo = response.results[0];

                    if (userInfo === undefined) {
                        // 新規ユーザー登録
                        insertNewUser(googleAuth).done(function (response) {

                            // 登録したユーザーと部屋情報が返却される
                            registerInfo = response.results;

                            roomInfo.room_id = registerInfo["room_id"];
                            roomInfo.room_name = registerInfo["room_name"];
                            roomInfo.room_number = registerInfo["room_number"];
                            roomInfo.user_id = registerInfo["user_id"];
                            roomInfo.is_owned = true;
                            localStorage.setItem('roomInfo.room_id', roomInfo.room_id);

                            userInfo = {};
                            userInfo.user_id = registerInfo["user_id"];
                            userInfo.email = registerInfo["email"];
                            userInfo.user_name = registerInfo["user_name"];
                            userInfo.auth_type = registerInfo["auth_type"];
                            userInfo.auth_id = registerInfo["auth_id"];
                            userInfo.app_token = registerInfo["app_token"];

                            isSingIn = true;

                            if (inviteInfo.invite_room_id != undefined) {
                                // 招待された部屋を追加
                                setInviteRoom();
                            } else {
                                // 部屋を設定してTOP画面を表示する
                                setDefaultRoom();
                            }
                        });

                    } else {
                        // 既存ユーザー情報あり
                        isSingIn = true;

                        if (inviteInfo.invite_room_id != undefined) {
                            // 招待された部屋を追加
                            setInviteRoom();
                        } else {
                            // 部屋を設定してTOP画面を表示する
                            setDefaultRoom();
                        }
                    }
                });

            } else {
                alert("Google認証情報を取得できていません");
            }
        });
    }

    /*
    * ほーむわーくユーザーでの初回ログイン処理
    */
    function firstLoginWithHomework() {

        showLoading();

        // 端末のUUIDを取得
        var serial = device.serial;

        // ユーザーの存在チェック&Token更新
        getUserInfoBySerial(serial).done(function (response) {

            userInfo = response.results[0];

            if (userInfo === undefined) {
                // 新規ユーザー登録
                insertOriginalUser(serial, $scope.userName).done(function (response) {

                    // 登録したユーザーと部屋情報が返却される
                    registerInfo = response.results;

                    roomInfo.room_id = registerInfo["room_id"];
                    roomInfo.room_name = registerInfo["room_name"];
                    roomInfo.room_number = registerInfo["room_number"];
                    roomInfo.user_id = registerInfo["user_id"];
                    roomInfo.is_owned = true;
                    localStorage.setItem('roomInfo.room_id', roomInfo.room_id);

                    userInfo = {};
                    userInfo.user_id = registerInfo["user_id"];
                    userInfo.email = registerInfo["email"];
                    userInfo.user_name = registerInfo["user_name"];
                    userInfo.auth_type = registerInfo["auth_type"];
                    userInfo.auth_id = registerInfo["auth_id"];
                    userInfo.app_token = registerInfo["app_token"];

                    isSingIn = true;

                    localStorage.setItem('homework_user.serial', serial);

                    if (inviteInfo.invite_room_id != undefined) {
                        // 招待された部屋を追加
                        setInviteRoom();
                    } else {
                        // 部屋を設定してTOP画面を表示する
                        setDefaultRoom();
                    }
                });

            } else {
                // 既存ユーザー情報あり
                isSingIn = true;
                localStorage.setItem('homework_user.serial', serial);

                if (inviteInfo.invite_room_id != undefined) {
                    // 招待された部屋を追加
                    setInviteRoom();
                } else {
                    // 部屋を設定してTOP画面を表示する
                    setDefaultRoom();
                }
            }
        });
    }

    /*
    * 招待された部屋に設定しTOP画面に遷移する
    */
    function setInviteRoom() {

        addInviteRoom().done(function (response) {

            // エラーが返却されたそのままの部屋情報でログイン
            // 問題なければ初期設定の部屋情報を更新する
            if (response.message !== undefined) {
                ons.notification.alert({
                    title: "",
                    messageHTML: response.message,
                }
                );
                setDefaultRoom();
                return false;
            }

            if (response.results !== null) {
                roomInfo = response.results[0];
                roomInfo.is_owned = false;
                localStorage.setItem('roomInfo.room_id', roomInfo.room_id);
                // ログインしたら招待情報はリセット
                inviteInfo = {};
            }

            // TOP画面を表示する
            hideLoading();
            myNavigator.replacePage('layout.html');
        });
    }

    /*
    * ログイン時の部屋を設定する
    */
    function setDefaultRoom() {

        // 部屋情報取得
        getRoomsWithUser().done(function (response) {

            // 前回の部屋情報があれば引き継ぎ
            room_id = localStorage.getItem("roomInfo.room_id");

            if (room_id === null) {
                roomInfo = response.results[0];
                localStorage.setItem('roomInfo.room_id', roomInfo.room_id);
            } else {
                // 前回情報がある場合は初期設定の部屋を設定する
                if (1 < response.results.length) {
                    response.results.forEach(function (roomObj) {
                        if (roomObj.room_id == room_id) {
                            roomInfo = roomObj;
                        }
                    });
                } else {
                    roomInfo = response.results[0];
                }
            }
            myNavigator.replacePage('layout.html');
        }).always(function () {
            hideLoading();
        });
    }
});

/*
* TOPページコントローラ
*/
module.controller("topPageController", function ($scope) {

    // 現在日時の設定
    $scope.nowDate = moment().format('YYYY年MM月DD日');
    $scope.homeworkDate = moment().format('YYYY-MM-DD');
    $scope.baseTime = "0.5";
    $scope.header = {};
    $scope.header.title = "家事入力";
    $scope.pageName = "top";

    $scope.lockFlg = "0";
    $scope.insertTimeObj = {};

    var roomId = roomInfo.room_id;

    getHomeWorkListWithRoomId(roomId).done(function (response) {
        $scope.roomHomeworkList = response.results;

        // 最新の情報で更新
        $scope.$apply();
    }).always(function () {
        hideLoading();
    });

    // 当日の家事履歴を一括削除
    $scope.resetHomeworkTime = function (index) {

        // 画面読み込み開始時の処理
        // showLoading();

        var roomHomework = $scope.roomHomeworkList[index];
        bulkDeleteHomeworkHist(roomHomework.room_home_work_id).done(function (response) {
            getHomeWorkListWithRoomId(roomId).done(function (response) {
                $scope.roomHomeworkList = response.results;

                // 最新の情報で更新
                $scope.$apply();
            }).always(function () {
                // hideLoading();
            });
        });
    }

    // 家事登録
    $scope.callInputHomeWork = function (index) {

        // 家事登録
        var roomHomework = $scope.roomHomeworkList[index];
        $scope.roomHomeworkId = roomHomework.room_home_work_id;
        var homeworkTime = roomHomework.home_work_time_hh

        // 画面表示用のリストを加算
        if (homeworkTime == null) {
            $scope.roomHomeworkList[index].home_work_time_hh = 0.5;
        } else {
            $scope.roomHomeworkList[index].home_work_time_hh = zeroPad(Number(roomHomework.home_work_time_hh) + 0.5);
        }

        // bulkInsert用のリストを加算
        // 今回のタップの加算分のみを保持する
        var insertTime = $scope.insertTimeObj[roomHomework.room_home_work_id];
        if (insertTime == null) {
            $scope.insertTimeObj[roomHomework.room_home_work_id] = 0.5;
        } else {
            $scope.insertTimeObj[roomHomework.room_home_work_id] = zeroPad(Number($scope.insertTimeObj[roomHomework.room_home_work_id]) + 0.5);
        }

        // bulkInsert用のlockフラグ判定
        if ($scope.lockFlg == "0") {
            // フラグを設定して、bulkInsert処理を用意
            $scope.lockFlg = "1"
            // 3秒後にまとめてDB更新するよう処理を設定
            setTimeout(function () {
                // 5秒経過時のinsert_timeの値をAPIに渡す、Flg=offにする
                for (roomHomeworkId in $scope.insertTimeObj) {
                    registerHomeworkHist(roomHomeworkId, $scope.homeworkDate, $scope.insertTimeObj[roomHomeworkId]).done(function (response) {
                        // 最新の情報で更新
                        $scope.$apply();
                    });
                }
                $scope.lockFlg = "0";
                $scope.insertTimeObj = {};
            }, 3000);
        }
    };

    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function (event) {
        showLoading();
    });

});

/*
グラフページコントローラ
*/
module.controller("graphPageController", function ($scope) {

    $scope.header = {};
    $scope.header.title = "家事別集計";
    $scope.pageName = "graph";
    $scope.termLabel = "過去一か月";

    $scope.changeGraphType = function (btnName) {
        if (btnName === 'chatByHomeworks') {
            $scope.header.title = "家事別集計";
        } else {
            $scope.header.title = "ユーザー別家事集計";
        }
    }

    $scope.fromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    $scope.toDate = moment().format('YYYY-MM-DD');

    $scope.callJustMonth = function () {

        $scope.fromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
        $scope.toDate = moment().format('YYYY-MM-DD');

        $scope.termLabel = "過去一か月";

        // 画面読み込み開始時の処理
        showLoading();

        // 期間選択ポップオーバーの非表示
        term_list.hide();

        // グラフの再取得処理
        updateGraph($scope.fromDate, $scope.toDate);
    };

    $scope.callYesterDay = function () {
        var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
        $scope.fromDate = yesterday;
        $scope.toDate = yesterday;
        $scope.termLabel = "昨日";

        // 画面読み込み開始時の処理
        showLoading();

        // 期間選択ポップオーバーの非表示
        term_list.hide();

        // グラフの再取得処理
        updateGraph($scope.fromDate, $scope.toDate);
    };

    $scope.callToday = function () {
        var today = moment().format('YYYY-MM-DD');
        $scope.fromDate = today;
        $scope.toDate = today;

        $scope.termLabel = "今日";

        // 画面読み込み開始時の処理
        showLoading();

        // 期間選択ポップオーバーの非表示
        term_list.hide();

        // グラフの再取得処理
        updateGraph($scope.fromDate, $scope.toDate);
    };

    // グラフの再取得処理
    updateGraph($scope.fromDate, $scope.toDate);

    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function (event) {
        showLoading();
    });
});

/*
* グラフの再取得処理
*/
function updateGraph(fromDate, toDate) {

    // ユーザー別家事集計取得
    getHistSummaryByUser(fromDate, toDate).done(function (response) {

        //API返却値をグラフモジュール用に整形
        var data = [];
        var labels = [];

        response.results.forEach(function (histObj) {
            data.push(histObj["home_work_time_sum"]);
            labels.push(histObj["user_name"]);
        });

        var config = {
            type: 'pie',
            data: {
                datasets: [{
                    data: data,
                    backgroundColor: palette('tol', 12).map(function (hex) {
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

        if (data.length < 1) {
            document.getElementById("user_chart_area").style.display = "none";
            document.getElementById("chatByUsers_nonData").style.display = "block";
        } else {
            document.getElementById("chatByUsers_nonData").style.display = "none";
            document.getElementById("user_chart_area").style.display = "block";
            window.homeworkChart = new Chart(ctx, config);
        }
    }).always(function () {
        hideLoading();
    });

    // 家事別時間集計取得
    getHistSummaryByHomework(fromDate, toDate).done(function (response) {

        //API返却値をグラフモジュール用に整形
        var data = [];
        var labels = [];

        response.results.forEach(function (histObj) {
            data.push(histObj["home_work_time_sum"]);
            labels.push(histObj["home_work_name"]);
        });

        var config = {
            type: 'pie',
            data: {
                datasets: [{
                    data: data,
                    backgroundColor: palette('tol', 12).map(function (hex) {
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

        if (data.length < 1) {
            document.getElementById("homework_chart_area").style.display = "none";
            document.getElementById("chatByHomeworks_nonData").style.display = "block";
        } else {
            document.getElementById("chatByHomeworks_nonData").style.display = "none";
            document.getElementById("homework_chart_area").style.display = "block";
            window.homeworkChart = new Chart(ctx, config);
        }
    }).always(function () {
        hideLoading();
    });
};

/*
* 家事追加、編集ページコントローラ
*/
module.controller("EditPageController", function ($scope) {

    this.init = function (e) {

        var index = myNavigator.topPage.data.index;
        var roomHomeworkList = myNavigator.topPage.data.roomHomeworkList;

        // 変数初期化
        $scope.editPageDialog = {};

        $scope.editPageDialog.workname = "";
        // $scope.editPageDialog.baseHomeworkTime = "1.0";
        $scope.editPageDialog.isVisible = "true";
        $scope.editPageDialog.roomHomeworkId = "";

        // 編集前の値を設定  
        if (index !== undefined) {
            $scope.editPageDialog.workname = roomHomeworkList[index].home_work_name;
            // $scope.editPageDialog.baseHomeworkTime = roomHomeworkList[index].base_home_work_time_hh;
            $scope.editPageDialog.isVisible = roomHomeworkList[index].is_visible;
            $scope.editPageDialog.roomHomeworkId = roomHomeworkList[index].room_home_work_id;
        }

        // 各コントロールのイベント
        // $scope.editPageDialog.plusHour = function(){
        //     $scope.editPageDialog.baseHomeworkTime = plusHour($scope.editPageDialog.baseHomeworkTime);
        // };
        // $scope.editPageDialog.minusHour = function(){
        //     $scope.editPageDialog.baseHomeworkTime = minusHour($scope.editPageDialog.baseHomeworkTime);
        // };
        $scope.editPageDialog.clickVisible = function () {
            $scope.editPageDialog.isVisible = !$scope.editPageDialog.isVisible;
        };

        // 登録・更新処理
        $scope.editPageDialog.insertRoomHomework = function () {

            var record = [];
            var homework = {};
            homework['home_work_name'] = $scope.editPageDialog.workname;
            // homework['base_home_work_time'] = Number($scope.editPageDialog.baseHomeworkTime);
            homework['base_home_work_time'] = Number("0.5");
            homework['room_home_work_id'] = $scope.editPageDialog.roomHomeworkId;
            homework['is_visible'] = $scope.editPageDialog.isVisible;
            record.push(homework);

            // 画面読み込み開始時の処理
            showLoading();

            // 更新処理
            updateRoomHomework(userInfo.user_id, roomInfo.room_id, record).done(function (response) {
            }).always(function () {
                hideLoading();
                myNavigator.popPage();
            });
        };

        // 部屋家事の削除
        $scope.editPageDialog.deleteRoomHomework = function () {

            ons.notification.confirm({ message: "削除してよろしいですか？", buttonLabels: ["いいえ", "はい"], title: "確認", }).then(function (result) {

                if (result === 0) {
                    return false;
                }

                var homework = {};
                homework['room_home_work_id'] = $scope.editPageDialog.roomHomeworkId;
                var record = [];
                record.push(homework);

                // 画面読み込み開始時の処理
                showLoading();

                deleteRoomHomework(record).done(function (response) {
                }).always(function () {
                    hideLoading();
                    myNavigator.popPage();
                });
            });
        };

        // キャンセル
        $scope.editPageDialog.back = function () {
            myNavigator.popPage();
        };
    };
});

/*
* 家事追加、編集ページコントローラ
*/
module.controller("addHomeworkPageController", function ($scope) {

    this.show = function (e) {

        $scope.header = {};
        $scope.header.title = "家事設定";
        $scope.pageName = "add_homework";

        // 部屋家事の取得
        var roomId = roomInfo.room_id;
        getRoomHomework(roomId).done(function (response) {

            $scope.roomHomeworkList = response.results;

            // 最新の情報で更新
            $scope.$apply();
        }).always(function () {

            hideLoading();

        });
    }

    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function (event) {
        showLoading();
    });

    // 新規追加ボタンから呼ばれる処理
    $scope.callEditPage = function (index) {
        myNavigator.insertPage(1, 'editPage.html', { data: { roomHomeworkList: $scope.roomHomeworkList } });
    }

});

/*
* メンバ管理ページコントローラ
*/
module.controller("memberPageController", function ($scope) {

    $scope.header = {};
    $scope.header.title = "メンバー管理";
    $scope.pageName = "member";

    // ログイン中のユーザーが部屋のオーナーかどうか
    $scope.roomInfo = {};
    $scope.roomInfo.is_owned = roomInfo.is_owned;

    // メンバー一覧取得
    getRoomUserIncludeOwner().done(function (response) {
        $scope.roomMemberList = response.results;
        // 最新の情報で更新
        $scope.$apply();
    }).always(function () {
        hideLoading();
    });

    // 部屋ユーザー削除
    $scope.removeMember = function (index) {

        // IDから該当するユーザー情報を特定する
        var memberObj = $scope.roomMemberList[index];

        ons.notification.confirm(
            {
                message: memberObj.user_name + 'さんを部屋から除外してよろしいですか？',
                buttonLabels: ["いいえ", "はい"],
                title: "確認",
            }).then(function (result) {

                if (result === 0) {
                    return false;
                }

                // 画面読み込み開始時の処理
                showLoading();

                removeMember(memberObj.user_id).done(function (response) {
                    // メンバー一覧取得
                    getRoomUserIncludeOwner().done(function (response) {
                        $scope.roomMemberList = response.results;
                        // 最新の情報で更新
                        $scope.$apply();
                    }).always(function () {
                        hideLoading();
                    });
                });
            });
    };

    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function (event) {
        showLoading();
    });
});

/*
* 設定ページコントローラ
*/
module.controller("settingPageController", function ($scope) {

    $scope.header = {};
    $scope.header.title = "設定";
    $scope.pageName = "setting";

    $scope.userName = userInfo.user_name;
    $scope.roomName = roomInfo.room_name;
    $scope.roomNo = roomInfo.room_number;
    $scope.is_owned = roomInfo.is_owned;
    $scope.room_id = roomInfo.room_id;
    $scope.selectRoom = {};

    // 部屋一覧取得
    getRoomsWithUser().done(function (response) {

        $scope.roomList = response.results;

        // 現在の部屋を設定する
        response.results.forEach(function (roomObj) {
            if (roomObj["room_id"] == roomInfo.room_id) {
                $scope.selectRoom = roomObj;
            }
        });
        // 最新の情報で更新
        $scope.$apply();
    }).always(function () {
        hideLoading();
    });

    // 部屋追加
    $scope.callAddRoom = function (obj) {

        ons.createDialog('addRoom.html', { parentScope: $scope }).then(function (dialog) {

            $scope.addRoomDialog = dialog;
            $scope.addRoomDialog.roomName = "";
            $scope.addRoomDialog.roomNumber = "";

            $scope.addRoomDialog.addRoom = function () {

                // 画面読み込み開始時の処理
                $scope.addRoomDialog.hide();
                showLoading();

                addRoom($scope.addRoomDialog.roomName, $scope.addRoomDialog.roomNumber).done(function (response) {

                    if (response.results === null) {
                        hideLoading();
                        return;
                    }

                    // 追加後の部屋一覧を取得する
                    getRoomsWithUser().done(function (response) {
                        $scope.roomList = response.results;
                        // 現在の部屋を設定する
                        response.results.forEach(function (roomObj) {
                            if (roomObj["room_id"] == roomInfo.room_id) {
                                $scope.selectRoom = roomObj;
                            }
                        });
                        // 最新の情報で更新
                        $scope.$apply();
                    }).always(function () {
                        hideLoading();
                    });
                });
            };

            $scope.addRoomDialog.show();
        });
    };

    // 保存
    $scope.register = function (obj) {

        // 画面読み込み開始時の処理
        showLoading();

        if ($scope.is_owned != 1) {

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
        updateRoom($scope.roomName, $scope.roomNo).done(function (response) {

            roomInfo.room_name = response.results.room_name;
            roomInfo.room_number = response.results.room_number;
            roomInfo.room_id = response.results.room_id;

            $scope.roomName = roomInfo.room_name;
            $scope.roomNo = roomInfo.room_number;

            // 部屋一覧取得
            getRoomsWithUser().done(function (response) {

                $scope.roomList = response.results;

                // 現在の部屋を設定する
                response.results.forEach(function (roomObj) {
                    if (roomObj["room_id"] == roomInfo.room_id) {
                        $scope.selectRoom = roomObj;
                    }
                });

                // 最新の情報で更新
                $scope.$apply();

            }).always(function () {
                hideLoading();
            });
        });
    };

    // 部屋切替
    $scope.changeRoom = function (obj) {

        // 現在の部屋を設定する
        $scope.roomName = $scope.selectRoom.room_name;
        $scope.roomNo = $scope.selectRoom.room_number;
        $scope.room_id = $scope.selectRoom.room_id;
        $scope.is_owned = $scope.selectRoom.is_owned;

        localStorage.setItem('roomInfo.room_id', $scope.room_id);

        $scope.$apply();
    };

    // LINEで招待
    $scope.callInvite = function (obj) {

        // 招待URL取得処理を呼び出し
        getInviteUrl(roomInfo.room_id, userInfo.user_id).done(function (response) {

            showLoading();

            // パラメータ渡しLINEを起動
            var msg = "line://msg/text/" + encodeURIComponent('\
《ほーむわーくアプリへ招待》\r\n\
家事を記録してシェアする「ほーむわーく」アプリの招待です。\r\n\
部屋への参加\r\n');

            msg = msg + response.results.invite_url;
            window.open(msg, '_system', 'location=yes');

            return false;

        }).always(function () {
            hideLoading();
        });
    };

    // 画面読み込み開始時の処理
    $scope.$on('$includeContentLoaded', function (event) {
        showLoading();
    });
});

/*
* ユーザー情報ページコントローラ
*/
module.controller("userInfoPageController", function ($scope) {

    $scope.header = {};
    $scope.header.title = "ユーザー情報";
    $scope.pageName = "user_info";

    $scope.userName = userInfo.user_name;

    // 保存
    $scope.register = function (obj) {

        // 画面読み込み開始時の処理
        showLoading();

        // ユーザー更新
        updateUser($scope.userName).done(function (response) {

            userInfo.user_name = response.results["user_name"];
            $scope.userName = userInfo.user_name;
            localStorage.setItem('roomInfo.room_id', roomInfo.room_id);

        }).always(function () {
            hideLoading();
        });
    };
});
