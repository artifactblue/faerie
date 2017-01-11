"use strict";
var LineMessaging = require('hubot-line-messaging');
var StickerMessage = require('hubot-line-messaging').StickerMessage;
var SendSticker = LineMessaging.SendSticker;
var SendLocation = LineMessaging.SendLocation;
var SendImage = LineMessaging.SendImage;
var SendVideo = LineMessaging.SendVideo;
var SendAudio = LineMessaging.SendAudio;
var SendText = LineMessaging.SendText;

const BuildTemplateMessage = LineMessaging.BuildTemplateMessage;

const LINE_TOKEN = process.env.HUBOT_LINE_TOKEN;

module.exports = function(robot){
  var filterStickers = function(message){
    var result = false;
    var stickerMsg = message.message;
    if (stickerMsg && stickerMsg.type && stickerMsg.type === 'sticker'){
      result = true;
    }
    // Not implement listener, so should CatchAllMessage.message
    console.log("message: ", message);
    var user = message.user;
    robot.brain.set('USER:' + user.id, user);
    return result;
  };

  robot.listen(filterStickers, function(res){
    var stickerMessage = res.message.message;
    // This line is necessary to prevent error
    res.envelope.message = stickerMessage;
    var sticker = new SendSticker(stickerMessage.stickerId, stickerMessage.packageId);
    res.reply(sticker);
  });

  robot.respond(/hello/i, function(res){
    res.reply('world');
  });

  robot.hear(/profile/i, function(res){
    console.log("HUBOT_LINE_TOKEN ", LINE_TOKEN);
    console.log("USERID " , res.message.user.id);
    robot.http("https://api.line.me/v2/bot/profile/" + res.message.user.id)
      .header('Authorization', "Bearer " + LINE_TOKEN)
      .get()(function(err, resp, body) {
        console.log('RESP ', resp);
        console.log('BODY ', body);
        res.reply('你好，' + resp.displayName + "，使用者ID " + res.message.user.id);
      });
  });

  robot.hear(/help/i, function(res){
    var text1 = new SendText('輸入 [subscribe]，即可享受訂閱推播服務');
    var text2 = new SendText('輸入 [list]，即可顯示Top 3推薦漫畫');
    var text3 = new SendText('輸入 [profile]，顯示個人資訊');

    res.reply(text1, text2, text3);
  });

  robot.hear(/buttons/i, function(res){
    var msg = BuildTemplateMessage
      .init('this is a template msg')
      .buttons({
        thumbnailImageUrl: 'https://github.com/puresmash/chatting-robot/blob/develope/docs/template.jpg?raw=true',
        title: 'Template Message',
        text: 'Let me google for you'
      })
      .action('uri', {
        label: 'Open Google',
        uri: 'https://www.google.com.tw/'
      })
      .action('uri', {
        label: 'Adapter Link',
        uri: 'https://github.com/puresmash/hubot-line-messaging'
      })
      .build();
    res.reply(msg);
  });


  robot.hear(/comic/i, function(res){
    var msg = BuildTemplateMessage
      .init('漫畫清單')
      .carousel({
        thumbnailImageUrl: 'http://static.fzdm.com/manhua/10.jpg',
        title: '獵人',
        text: '最新：獵人360話'
      })
      .action('uri', {
        label: '獵人',
        uri: 'http://140.110.203.1/test_comicr/api/pageGet.php?title=%E7%8D%B5%E4%BA%BA%E6%BC%AB%E7%95%AB&vol=10&comicLink=360'
      })
      .carousel({
        thumbnailImageUrl: 'http://static.fzdm.com/manhua/02.jpg',
        title: '海賊王',
        text: '最新：海贼王851話'
      })
      .action('uri', {
        label: '海賊王',
        uri: 'http://140.110.203.1/test_comicr/api/pageGet.php?title=%E6%B5%B7%E8%B3%8A%E7%8E%8B%E6%BC%AB%E7%95%AB&vol=2&comicLink=851'
      })
      .carousel({
        thumbnailImageUrl: 'http://static.fzdm.com/manhua/01.jpg',
        title: '火影忍者',
        text: '最新：火影忍者傳人傳08話'
      })
      .action('uri', {
        label: '火影忍者',
        uri: 'http://140.110.203.1/test_comicr/api/pageGet.php?title=%E7%81%AB%E5%BD%B1%E5%BF%8D%E8%80%85%E6%BC%AB%E7%95%AB&vol=1&comicLink=brz08'
      })
      .build();
    res.reply(msg);
  });

  robot.hear(/subscribe/i, function(res){
    var msg = BuildTemplateMessage
      .init('訂閱漫畫')
      .confirm({
        text: '訂閱海賊王?'
      })
      .action('postback', {
        label: '訂閱',
        data: 'subscribe=true&comic=02'
        //uri: 'https://www.google.com.tw/search?q=ok'
      })
      .action('message', {
        label: '取消',
        text: '太可惜了'
      })
      .build();
    res.reply(msg);
  });
};
