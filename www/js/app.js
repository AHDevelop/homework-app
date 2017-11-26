var isSingIn = false;

/**
ユーザー別グラフを表示
*/
function chatByUsers() {
  var config = {
    type: 'pie',
    data: {
      datasets: [{
        data: [65, 10, 5, 10],
        backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1"]
      }],
      labels: ["YUKI", "TAKASHI", "YUTA", "HARUKA"]
    },
    options: {
      responsive: true
    }
  };
  var ctx = document.getElementById("pie-chart-area").getContext("2d");
  window.myPie = new Chart(ctx, config);
}

/**
家事別グラフを表示
*/
function chatByWorks() {
  var config = {
    type: 'pie',
    data: {
      datasets: [{
        data: [35, 30, 20, 5, 5, 5],
        backgroundColor: ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360", "#949FB1"]
      }],
      labels: ["掃除" , "洗濯", "洗い物", "犬の散歩", "息子の世話", "勉強の手伝い"]
    },
    options: {
      responsive: true
    }
  };
  var ctx = document.getElementById("pie-chart-area").getContext("2d");
  window.myPie = new Chart(ctx, config);
}

/*
サインイン処理
*/
function signIn(){
  isSingIn = ture;
}

/*
サインアウト処理
*/
function signOut(){
  isSingIn = false;
}
