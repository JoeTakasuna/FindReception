var scheduleSheetId = PropertiesService.getScriptProperties().getProperties().sheetId;

var calendar = [
  CalendarApp.getCalendarById('カレンダーID1'),
  CalendarApp.getCalendarById('カレンダーID2'),
  ];

function main() { 
  var scheduleList = setSheet(scheduleSheetId);
  
  var today    = new Date(new Date().toLocaleDateString());
  var tommorow = new Date(new Date().toLocaleDateString());
  tommorow.setDate(tommorow.getDate()+1);
  
  //複数のカレンダーから取得
  for (var room = 0; room < calendar.length; room++) {
    var lastRow = scheduleList.getLastRow()
  
    var events = calendar[room].getEvents(today, tommorow);
    
    //予定の数だけ繰り返し
    for (var i = 0; i < events.length; i++) {
      var title     = events[i].getTitle();
      var startTime = events[i].getStartTime();
      var endTime   = events[i].getEndTime();
      var location  = events[i].getLocation();
      var detail    = events[i].getDescription();
      
      var regex = /×.+様/;
      
      //訪問予定の場合
      if (regex.test(title)) {
        var name = String(title.match(regex)).slice(1,-1);
        var kanaCandidates = translateToKanaArray(name);
        
        var scheduleInfo = [title, startTime, endTime, location, kanaCandidates[0], kanaCandidates[1], kanaCandidates[2], detail]
        scheduleList.appendRow(scheduleInfo)
        
        //訪問予定では無い場合
      } else {
        var scheduleInfo = [title, startTime, endTime, location, 'undefined', 'undefined', 'undefined', detail]
        scheduleList.appendRow(scheduleInfo)
      }
    }
  }
}

function setSheet(scheduleSheetId) {
  var spreadsheet = SpreadsheetApp.openById(scheduleSheetId);
  var scheduleList = spreadsheet.getSheetByName('main');
  scheduleList.clearContents();
  
  var scheduleInfoTitle = ['予定名', '開始日時', '終了日時', '場所', 'フリガナ1', 'フリガナ2', 'フリガナ3', '詳細']
  scheduleList.appendRow(scheduleInfoTitle)
  
  return scheduleList
}

function translateToKanaArray(name) {
  var apiUrl = 'http://yomi-tan.jp/api/yomi.php?ic=UTF-8&oc=UTF-8&k=k&n=3&t=' + name;
  var kanaCandidates = UrlFetchApp.fetch(apiUrl);
  kanaCandidates = kanaCandidates.toString().split(',')
  return kanaCandidates
}
