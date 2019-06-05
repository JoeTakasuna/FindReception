var scheduleSheetId = PropertiesService.getScriptProperties().getProperties().sheetId;

function doPost(e) {
  var receptedName = extractName(e.parameter.text);
  var scheduleList = getActiveSheet(scheduleSheetId, 'main');
  
  var candidateSchedules = searchSchedule(receptedName, scheduleList)
  candidateSchedules.forEach(postSchedule)
}

function extractName(receptedText) {
  var regex1 = /から.+? 様/;
  var regex2 = /に、.+? 様/;
  if (regex1.test(receptedText)) {
    var name = receptedText.match(regex1);
  } else if (regex2.test(receptedText)) {
    var name = receptedText.match(regex2);
  }
  name = String(name).slice(4,-3);
  return name
}

function getActiveSheet(sheetId, sheetName) {
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  var sheet = spreadsheet.getSheetByName(sheetName);
  var scheduleList = sheet.getDataRange().getValues();
  scheduleList.shift(); // カラムタイトルを削除
  return scheduleList
}

function searchSchedule (receptedName, scheduleList) {
  return scheduleList.filter(function(value, index) {
    var now       = new Date();
    var startTime = new Date(scheduleList[index][1]);
    var earlyTime = new Date(new Date().setMinutes(startTime.getMinutes() - 20));
    var lateTime  = new Date(new Date().setMinutes(startTime.getMinutes() + 20));
    var scheduledName1 = scheduleList[index][4];
    var scheduledName2 = scheduleList[index][5];
    var scheduledName3 = scheduleList[index][6];
    return earlyTime < now && now < lateTime && (receptedName.indexOf(scheduledName1) === 0 || receptedName.indexOf(scheduledName2) === 0 || receptedName.indexOf(scheduledName3) === 0)
  })
}

function postSchedule (scheduleInfo) {
  var name      = scheduleInfo[0];
  var startDate = scheduleInfo[1].toLocaleDateString();
  var startTime = scheduleInfo[1].toLocaleTimeString().slice(0,-7);
  var endTime   = scheduleInfo[2].toLocaleTimeString().slice(0,-7);
  var place     = scheduleInfo[3];
  var message = 'こちらの予定でしょうか：\n' + name + ' at   *' + place + '*\n'+startDate + ' ' + startTime + ' ~ '+endTime;
  postMessage(message)
}

function postMessage(message) {
  var postUrl = PropertiesService.getScriptProperties().getProperties().postUrl;
  var jsonData =
  {
    "username"  : "botの名前",
    "icon_emoji": "botの絵文字",
    "text"      : message
  };
  var payload = JSON.stringify(jsonData);

  var options =
  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : payload
  };

  UrlFetchApp.fetch(postUrl, options);
}
