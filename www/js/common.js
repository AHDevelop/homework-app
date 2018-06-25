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
