"use strict";
var LineMessaging = require('hubot-line-messaging-api');
var StickerMessage = require('hubot-line-messaging-api').StickerMessage;
var PostbackMessage = require('hubot-line-messaging-api').PostbackMessage;
var SendSticker = LineMessaging.SendSticker;
var SendLocation = LineMessaging.SendLocation;
var SendImage = LineMessaging.SendImage;
var SendVideo = LineMessaging.SendVideo;
var SendAudio = LineMessaging.SendAudio;
var SendText = LineMessaging.SendText;
var comic = require('../db/models/comic.js');
var users = require('../db/models/users.js');
var userSubscription = require('../db/models/userSubscription.js');

const BuildTemplateMessage = LineMessaging.BuildTemplateMessage;

const LINE_TOKEN = process.env.HUBOT_LINE_TOKEN;

module.exports = function(robot){

  /**
   * Image URL (Max: 1000 characters)
   * HTTPS
   * JPEG or PNG
   * Aspect ratio: 1:1.51
   * Max width: 1024px
   * Max: 1 MB
   */

  /**
   * Filter all sticker message
   */ 
  var filterStickers = function(message){
    var result = false;
    var stickerMsg = message.message;
    if (stickerMsg && stickerMsg.type && stickerMsg.type === 'sticker'){
      result = true;
    }
    var user = message.user;
    robot.brain.set('USER:' + user.id, user);
    return result;
  };

  /**
   * Filter all postback message
   */ 
  var filterPostback = function(message){
    var result = false;
    var postbackMsg = message.message;
    if (postbackMsg && postbackMsg.type && postbackMsg.type === 'postback'){
      console.log(message.message);
      result = true;
      robot.http("https://api.line.me/v2/bot/profile/" + postbackMsg.user.id)
        .header('Authorization', "Bearer " + LINE_TOKEN)
        .get()(function(err, resp, body) {
          var respBody = JSON.parse(body);
          var entity = {id: respBody.userId, displayName: respBody.displayName}
          users.create(entity).then(function(result){
            console.log(respBody.userId + ' updated');
          });
        });
    }
    return result;
  }

  /**
   * Do postback action
   */
  robot.listen(filterPostback, function(res){
    var postbackMsg = res.message.message.postback;
    console.log(res.message.user.id + ", " + postbackMsg.data);
    var postbackData = postbackMsg.data.split('&');
    var entity = {userId: res.message.user.id};
    postbackData.forEach(function(param){
      var data = param.split('=');
      entity[data[0]] = data[1];
    });

    subscriptionComic(entity);
  });

  /**
   * Reply any sticker message
   */
  robot.listen(filterStickers, function(res){
    var stickerMessage = res.message.message;
    // This line is necessary to prevent error
    res.envelope.message = stickerMessage;
    var sticker = new SendSticker(stickerMessage.stickerId, stickerMessage.packageId);
    res.reply(sticker);
  });

  /**
   * Get user profile
   */
  robot.hear(/whoami/i, function(res){
    robot.http("https://api.line.me/v2/bot/profile/" + res.message.user.id)
      .header('Authorization', "Bearer " + LINE_TOKEN)
      .get()(function(err, resp, body) {
        var respBody = JSON.parse(body);
        var text1 = new SendText('你好，' + respBody.displayName);
        var text2 = new SendText('使用者ID ' + res.message.user.id);
        res.reply(text1, text2);
      });
  });

  /**
   * Support on this bot
   */
  robot.hear(/help/i, function(res){
    var text1 = new SendText('輸入 [top]，顯示Top 3推薦漫畫');
    var text2 = new SendText('輸入 [list]，顯示訂閱清單');
    var text3 = new SendText('輸入 [whoami]，顯示個人資訊');
    res.reply(text1, text2, text3);
  });

  /**  
   * Get Top 3 comic
   */
  robot.hear(/top/i, function(res){
    var comicList = comic.readAll().then(function(result){
      var msg = buildCarousel("comic recommend", result);
      res.reply(msg);
    });
  });

  /**
   * List all comic subscription
   */
  robot.hear(/list/i, function(res){
    userSubscription.read(res.message.user.id).then(function(result){
      var msg = buildButton("subscription list", result);
      res.reply(msg);
    });
  });

  /**
   * push notification
   */
  robot.hear(/push/i, function(res){
    pushMessage('U33823165fc452e43a0a66ad60fba52bf', "通知");
    res.reply(new SendText('通知服務'));
  });

  /**
   * Push message API 
   */
  function pushMessage(user, message) {
    var postData = JSON.stringify({
      "to": user,
      "messages":[
        {
          "type": "text",
          "text": message
        }
      ]
    });
    console.log('postData', postData);
    robot.http("https://api.line.me/v2/bot/message/push")
      .header('Authorization', "Bearer " + LINE_TOKEN)
      .header('Content-Type', 'application/json')
      .post(postData)(function(err, resp, body) {
        console.log(err, resp, body);
      });
  }

  /**
   * Build comic carousel
   */
  function buildCarousel(altText, result) {
    var columns = [];
    result.rows.forEach(function(data){
      var carousel = {
        "thumbnailImageUrl": data.thumbnail,
        "title": data.comicname,
        "text": data.lastvolnumber,
        "actions": [
          {
            "type": "uri",
            "label": "線上觀看",
            "uri": "https://github.com/Ksetra/morphling"
          },
          {
            "type": "postback",
            "label": "訂閱[" + data.comicname + "]",
            "data": "status=" + userSubscription.SUBSCRIBE + "&comicId=" + data.id
          }
        ]
      };
      columns.push(carousel);
    });
    var obj = {
      "type": "template",
      "altText": altText,
      "template": {
          "type": "carousel",
          "columns": columns
      }
    }
    return obj;
  }

  function buildButton(altText, result) {
    var actions = [];
    result.rows.forEach(function(data){
      var action = {
        "type": "postback",
        "label": "取消訂閱[" + data.comicname + "]",
        "data": "status=" + userSubscription.UNSUBSCRIBE + "&comicId=" + data.id
      }
      actions.push(action);
    });
    var obj = {
      "type": "template",
      "altText": altText,
      "template": {
          "type": "buttons",
          "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
          "title": "訂閱清單",
          "text": "點選取消訂閱",
          "actions": actions
      }
    }
    return obj;
  }

  /**
   * Do subscribe
   */
  function subscriptionComic(entity) {
    if (entity.status == userSubscription.SUBSCRIBE) {
      userSubscription.create(entity).then(function(result){
        comic.read().then(function(comicResult){
          console.log('subscribe', comicResult);
          pushMessage(entity.userId, "[" + comicResult.rows[0].comicname + "] 訂閱完成");
        });
      }).catch(function(err){
        console.log(err);
      });
    } else if (entity.status = userSubscription.UNSUBSCRIBE) {
      userSubscription.update(entity).then(function(result){
        comic.read().then(function(comicResult){
          console.log('unsubscribe', comicResult);
          pushMessage(entity.userId, "[" + comicResult.rows[0].comicname + "] 已取消訂閱");
        });
      }).catch(function(err){
        console.log(err);
      });
    }
  }

  // robot.hear(/buttons/i, function(res){
  //   var msg = BuildTemplateMessage
  //     .init('this is a template msg')
  //     .buttons({
  //       thumbnailImageUrl: 'https://github.com/puresmash/chatting-robot/blob/develope/docs/template.jpg?raw=true',
  //       title: 'Template Message',
  //       text: 'Let me google for you'
  //     })
  //     .action('uri', {
  //       label: 'OK',
  //       uri: 'https://www.google.com.tw/search?q=ok'
  //     })
  //     .action('postback', {
  //       label: 'postback',
  //       data: 'test=a'
  //     })
  //     .build();
  //   res.reply(msg);
  // });

  // robot.hear(/confirm/i, function(res){
  //   var msg = BuildTemplateMessage
  //   .init('this is a confirm msg')
  //   .confirm({
  //       text: 'confirm?'
  //   })
  //   .action('uri', {
  //       label: 'OK',
  //       uri: 'https://www.google.com.tw/search?q=ok'
  //   })
  //   .action('message', {
  //       label: 'Cancel',
  //       text: 'cancel request'
  //   })
  //   .build();
  //   res.reply(msg);
  // });
};
