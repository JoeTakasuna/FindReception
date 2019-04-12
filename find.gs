function doPost(e) {
  //スクリプトプロパティ取得
  var prop = PropertiesService.getScriptProperties().getProperties();
  var bot_name = '<bot名>';
  var bot_icon = '<アイコン用絵文字>';
  
  var app = SlackApp.create(prop.slackToken);
  
  //POST元が違っていたらエラー
  if (prop.verifyToken != e.parameter.token) {
    throw new Error('invalid token.');
  }
  
  //受付投稿から名字を抽出
  var regex1 = /から.+? 様/;
  var regex2 = /に、.+? 様/;
  if (regex1.test(e.parameter.text)) {
    var name = e.parameter.text.match(regex1);
  } else if (regex2.test(e.parameter.text)) {
    var name = e.parameter.text.match(regex2);
  }
  name = String(name).slice(4).slice(0,-3);
  
  //アクティブなシートを取得
  var spreadsheet = SpreadsheetApp.openById('<スプレッドシートID>');
  var sheet = spreadsheet.getSheetByName('main');
  var range = sheet.getDataRange().getValues();
  
  //対応する予定をmainシートからnameで検索し、messageに格納
  for (var i = 1; i < range.length; i++) {
    //予定時刻の±25分で制限
    if (range[i][7] < new Date() && new Date() < range[i][8] && name.indexOf(range[i][6]) === 0) {
      var message = 'こちらの予定でしょうか：\n' + range[i][0]　+ ' at   *' + range[i][5] + '*\n' + range[i][1].toLocaleDateString() + ' ' + range[i][2].toLocaleTimeString().slice(0,-7) + ' ~ ' + range[i][3].toLocaleTimeString().slice(0,-7);
      
      //特定のチャンネルにメッセージをPOSTする
      return app.postMessage('<チャンネルID>', message , {
        username: bot_name,
        icon_emoji: bot_icon
      });
    }
  }
}
