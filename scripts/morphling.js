"use strict";
var LineMessaging = require('hubot-line-messaging-api');
var StickerMessage = require('hubot-line-messaging-api').StickerMessage;
//var PostbackMessage = require('hubot-line-messaging-api').PostbackMessage;
var SendSticker = LineMessaging.SendSticker;
var SendLocation = LineMessaging.SendLocation;
var SendImage = LineMessaging.SendImage;
var SendVideo = LineMessaging.SendVideo;
var SendAudio = LineMessaging.SendAudio;
var SendText = LineMessaging.SendText;
//var comic = require('../db/models/comic.js');

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
    //console.log("message: ", message);
    var user = message.user;
    robot.brain.set('USER:' + user.id, user);
    return result;
  };

  // var filterPostback = function(message){
  //   var result = false;
  //   var postbackMsg = message.message;
  //   if (postbackMsg && postbackMsg.type && postbackMsg.type === 'postback'){
  //     result = true;

  //     // TODO save to database
  //   }
  //   console.log('filterPostback', result);
  //   return result;
  // }

  // robot.listen(filterPostback, function(res){
  //   console.log('reply postback');
  //   // push API

  //   var text = new SendText('已訂閱完成，謝謝');
  //   res.reply(text);
  // });

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
        var respBody = JSON.parse(body);
        res.reply('你好，' + respBody.displayName + "，使用者ID " + res.message.user.id);
      });
  });

  robot.hear(/help/i, function(res){
    var text1 = new SendText('輸入 [subscribe]，即可享受訂閱推播服務');
    var text2 = new SendText('輸入 [list]，即可顯示Top 3推薦漫畫');
    var text3 = new SendText('輸入 [profile]，顯示個人資訊');

    res.reply(text1, text2, text3);
  });

  robot.hear(/b/i, function(res){
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
      .action('postback', {
        label: 'postback',
        label: 'test=a'
      })
      .build();
    res.reply(msg);
  });

  robot.hear(/s/i, function(res){
    var msg = BuildTemplateMessage
    .init('this is a confirm msg')
    .confirm({
        text: 'confirm?'
    })
    .action('uri', {
        label: 'OK',
        uri: 'https://www.google.com.tw/search?q=ok'
    })
    .action('message', {
        label: 'Cancel',
        text: 'cancel request'
    })
    .build();
    res.reply(msg);
  });

  /**
   * Image URL (Max: 1000 characters)
   * HTTPS
   * JPEG or PNG
   * Aspect ratio: 1:1.51
   * Max width: 1024px
   * Max: 1 MB
   *
   * 訂閱後收到 postback 這邊可以提供付費功能
   */
  robot.hear(/list/i, function(res){
    var msg = BuildTemplateMessage
    .init('this is a carousel msg')
    .carousel({
        thumbnailImageUrl: 'https://github.com/puresmash/chatting-robot/blob/develope/docs/template.jpg?raw=true',
        title: 'Carousel Message 1',
        text: 'text1'
    })
    .action('uri', {
        label: 'Open Google',
        uri: 'https://www.google.com.tw/'
    })
    .carousel({
        thumbnailImageUrl: 'https://github.com/puresmash/chatting-robot/blob/develope/docs/carousel.jpg?raw=true',
        title: 'Carousel Message 2',
        text: 'text2'
    })
    .action('uri', {
        label: 'Adapter Link',
        uri: 'https://github.com/puresmash/hubot-line-messaging'
    })
    .build();
    res.reply(msg);
    //var comicList = comic.readAll().then(function(result){
      // var msgObj = BuildTemplateMessage.init('Comic list');
      // var count = 0;
      // result.rows.forEach(function(data){
        // console.log('comic data', data);
      //   if (count == 0) {
      //     msgObj = BuildTemplateMessage.init('Comic list')
      //     .carousel({
      //       thumbnailImageUrl: data.thumbnail,
      //       title: data.comicname,
      //       text: data.lastvolnumber
      //     })
      //     .action('postback', {
      //       label: '線上觀看',
      //       data: 'viewOnline'
      //     })
      //     .action('postback', {
      //       label: '訂閱[' + data.comicname + ']',
      //       data: 'subscribe'
      //     });
      //   } else {
      //     msgObj
      //     .carousel({
      //       thumbnailImageUrl: data.thumbnail,
      //       title: data.comicname,
      //       text: data.lastvolnumber
      //     })
      //     .action('postback', {
      //       label: '線上觀看',
      //       data: 'viewOnline'
      //     })
      //     .action('postback', {
      //       label: '訂閱[' + data.comicname + ']',
      //       data: 'subscribe'
      //     });
      //   }
      //   count++;
      //   console.log('count: ' + count + ', msgObj: ', msgObj);
      // });
      // msgObj.build();
      // res.reply("yes");
    // });
  });

  // function msgCarousel(msgObj, data){
  //   msgObj.carousel({
  //     thumbnailImageUrl: data.thumbnail,
  //     title: data.comicname,
  //     text: data.lastvolnumber
  //   })
  //   .action('postback', {
  //     label: '線上觀看',
  //     data: 'viewOnline'
  //   })
  //   .action('postback', {
  //     label: '訂閱[' + data.comicname + ']',
  //     data: 'subscribe'
  //   });
  //   console.log('msgObj: ', msgObj);
  //   return msgObj;
  // }

  
};
