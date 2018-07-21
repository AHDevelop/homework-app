/*
* 家事登録ダイアログで家事時間を加算する
*/
function plusHour(hour){
    
    var hour =  Number(hour);
    
    if(hour < 24){
        hour += 0.5;
    }
    
    var hourStr = hour.toString();
    if(!hourStr.match(/\./)){
        hourStr += ".0";
    }
    
    return hourStr;
}

/*
* 家事登録ダイアログで家事時間を減算する
*/
function minusHour(hour){
    
    var hour =  Number(hour);
    
    if(0.5 < hour){
        hour -= 0.5;
    }
    
    var hourStr = hour.toString();
    
    if(!hourStr.match(/\./)){
        hourStr += ".0";
    }
    
    return hourStr;
}

/*
* 整数値に.0を追加する
*/
function zeroPad(hour){

    var hourStr = hour.toString();
    
    if(!hourStr.match(/\./)){
        hourStr += ".0";
    }

    return hourStr;
}

/**
 * Get the URL parameter value
 *
 * @param  name {string} パラメータのキー文字列
 * @return  url {url} 対象のURL文字列
 */
function getParam(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}