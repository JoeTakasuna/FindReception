function getSchedule() { 
  //カレンダーIDを指定して、カレンダーを取得
  var calendar = [
    CalendarApp.getCalendarById('<カレンダーID1>'),
    CalendarApp.getCalendarById('<カレンダーID2>')
    ];

  //mainシートを取得
  var spreadsheet = SpreadsheetApp.openById('<スプレッドシートID>');
  var sheet = spreadsheet.getSheetByName('main');
  sheet.clearContents();
  
  //kanaシートを取得
  var kanasheet = spreadsheet.getSheetByName('kana');
  var arrayLength = kanasheet.getDataRange().getValues().length;
  var kanjiArray = kanasheet.getRange(1,1,arrayLength).getValues();
  var kanaArray = kanasheet.getRange(1,2,arrayLength).getValues();

  //各行のタイトルを指定
  sheet.getRange('A'+(1)).setValue('予定名');
  sheet.getRange('B'+(1)).setValue('開始日');
  sheet.getRange('C'+(1)).setValue('開始時刻');
  sheet.getRange('D'+(1)).setValue('終了時刻');
  sheet.getRange('E'+(1)).setValue('予定の詳細');
  sheet.getRange('F'+(1)).setValue('場所');
  sheet.getRange('G'+(1)).setValue('フリガナ');
  sheet.getRange('H'+(1)).setValue('早く来た場合');
  sheet.getRange('I'+(1)).setValue('遅く来た場合');
  
  //対象の日付を範囲指定(今回は対象となる1日分を指定)して予定を取得
  var date = new Date().toLocaleDateString();
  var startDate = new Date(date); //取得開始日
  var endDate = new Date(date);
  endDate.setDate(endDate.getDate()+1);　//取得終了日
  
  //複数のカレンダーから取得
  for (var room = 0; room < calendar.length; room++) {
    var lastRow = sheet.getLastRow()
  
    //endDateは含まない 例12/01なら11/30がendになる
    var events = calendar[room].getEvents(startDate, endDate);
    
    //複数の読み方で下にずれる分
    var duplicate = 0;
    
    //予定の数だけ繰り返し
    for (var i = 0; i < events.length; i++) {
      //予定のタイトル
      var title = events[i].getTitle();
      //日にち
      var thisDate = events[i].getStartTime().toLocaleDateString();
      //開始時刻
      var startTime = events[i].getStartTime();
      var earlyTime = events[i].getStartTime();
      earlyTime.setMinutes(earlyTime.getMinutes() - 25)
      var lateTime = events[i].getStartTime();
      lateTime.setMinutes(lateTime.getMinutes() + 25)
      //終了時刻
      var endTime = events[i].getEndTime();
      //予定の詳細
      var detail = events[i].getDescription();
      //開催場所
      var location = events[i].getLocation();
      
      //フリガナへの変換
      var regex = /×.+様/;
      
      //訪問予定の場合
      if (regex.test(title)) {
        var name = title.match(regex);
        name = String(name).slice(1).slice(0,-1);
        
        for (var j = 0; j　<　arrayLength; j++) {
          if (kanjiArray[j][0] === name) {
            var kana = kanaArray[j][0];
            
            //シートに書き込み
            sheet.getRange('A'+(i+duplicate+lastRow+1)).setValue(title);
            sheet.getRange('B'+(i+duplicate+lastRow+1)).setValue(thisDate);
            sheet.getRange('C'+(i+duplicate+lastRow+1)).setValue(startTime).setNumberFormat('hh:mm');
            sheet.getRange('D'+(i+duplicate+lastRow+1)).setValue(endTime).setNumberFormat('hh:mm');
            sheet.getRange('E'+(i+duplicate+lastRow+1)).setValue(detail);
            sheet.getRange('F'+(i+duplicate+lastRow+1)).setValue(location);
            sheet.getRange('G'+(i+duplicate+lastRow+1)).setValue(kana);
            sheet.getRange('H'+(i+duplicate+lastRow+1)).setValue(earlyTime).setNumberFormat('hh:mm');
            sheet.getRange('I'+(i+duplicate+lastRow+1)).setValue(lateTime).setNumberFormat('hh:mm');
            duplicate++;
          }
        }
        duplicate--;
        
        //訪問予定では無い場合
      } else {
        sheet.getRange('A'+(i+duplicate+lastRow+1)).setValue(title);
        sheet.getRange('B'+(i+duplicate+lastRow+1)).setValue(thisDate);
        sheet.getRange('C'+(i+duplicate+lastRow+1)).setValue(startTime).setNumberFormat('hh:mm');
        sheet.getRange('D'+(i+duplicate+lastRow+1)).setValue(endTime).setNumberFormat('hh:mm');
        sheet.getRange('E'+(i+duplicate+lastRow+1)).setValue(detail);
        sheet.getRange('F'+(i+duplicate+lastRow+1)).setValue(location);
        sheet.getRange('G'+(i+duplicate+lastRow+1)).setValue('undefined');
        sheet.getRange('H'+(i+duplicate+lastRow+1)).setValue(earlyTime).setNumberFormat('hh:mm');
        sheet.getRange('I'+(i+duplicate+lastRow+1)).setValue(lateTime).setNumberFormat('hh:mm');
      }
    }
  }
}
