// function showWorkDetail(){
//   var modal = document.getElementById('workDetail');
//   modal.animation = "fade";
//   modal.show();
// }

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
