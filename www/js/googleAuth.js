/*
Google Auth 認証のクラス
*/
var googleAuth = {

    /*
    アプリ認証情報
    */
    clientId: '530549571921-k8utmfk322am2hrb6m9pjhl3msbrdntd.apps.googleusercontent.com',
    ClientSecret : '-bgqDaygcCiS4F_gbzZ9ZRuR',
    
    /*
    取得データ
    */
    accessToken : '',
    gmailLogin : '',
    gmailID : '',
    gmailEmail : '',
    gmailFirstName : '',
    gmailLastName : '',
    
    /*
    URL定義
    */
    scope : 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
    redirectUri : 'http://localhost',
    baseUrl : 'https://accounts.google.com/o/oauth2/',
    revokeUrl : this.baseUrl + 'revoke?token=' + this.accessToken,

    /*
    認証メイン処理
    */
    authorize: function() {
    
        var deferred = $.Deferred();
        
        var authUrlWithParam = googleAuth.baseUrl + 'auth?' + $.param({
            client_id: googleAuth.clientId,
            redirect_uri: googleAuth.redirectUri,
            response_type: 'code',
            scope: googleAuth.scope
        });
    
        var authWindow = window.open(authUrlWithParam, '_blank', 'location=no,toolbar=no');
    
        $(authWindow).on('loadstart', function(e) {
            var url = e.originalEvent.url;
            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);
            
            if (code || error) {
                console.log(error);
                authWindow.close();
            }
        
            if (code) {
                $.post(googleAuth.baseUrl + 'token', {
                    code: code[1],
                    client_id: googleAuth.clientId,
                    client_secret: googleAuth.ClientSecret,
                    redirect_uri: googleAuth.redirectUri,
                    grant_type: 'authorization_code'
                }).done(function(data) {
                    deferred.resolve(data);
                }).fail(function(response) {
                    deferred.reject(response.responseJSON);
                });
                
            } else if(error) {
                deferred.reject({
                    error: error[1]
                });
            }
        });
        
        return deferred.promise();
    },

  /*
  ユーザー認証を解除する
  */
  disconnectUser: function() {
      
      var deferred = $.Deferred();

      $.ajax({
          type: 'GET',
          url: googleAuth.baseUrl + 'revoke?token=' + googleAuth.accessToken,
          async: false,
          contentType: "application/json",
          dataType: 'jsonp',
          success: function(nullResponse) {
              deferred.resolve();
              googleAuth.accessToken = null;
          },
          error: function(e) {
            deferred.resolve();
            alert("予期せぬエラーが発生しました。");
          }
      });
      
      return deferred.promise();
  },

  /*
  ユーザー情報取得
  */
  getDataProfile: function() {

    var deferred = $.Deferred();
    
    $.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + googleAuth.accessToken)
        .done(function(data) {
            googleAuth.gmailLogin = "true";
            googleAuth.gmailID = data.id;
            googleAuth.gmailEmail = data.email;
            googleAuth.gmailFirstName = data.given_name;
            googleAuth.gmailLastName = data.family_name;
            deferred.resolve(data);
        }).fail(function(response) {
            deferred.reject(response.responseJSON);
    });

    return deferred.promise();
  },

  /*
  Google認証を呼び出す
  */
  callGoogle: function() {

      var deferred = $.Deferred();

      googleAuth.authorize().done(function(data) {

          googleAuth.accessToken = data.access_token;
          googleAuth.getDataProfile().done(function(data) {
            deferred.resolve(data);
          });
      });

      return deferred.promise();
  },

};
