"use strict";
var LineMessaging = require('hubot-line-messaging');
var StickerMessage = require('hubot-line-messaging').StickerMessage
var SendSticker = LineMessaging.SendSticker;
var SendLocation = LineMessaging.SendLocation;
var SendImage = LineMessaging.SendImage;
var SendVideo = LineMessaging.SendVideo;
var SendAudio = LineMessaging.SendAudio;
var SendText = LineMessaging.SendText;

const BuildTemplateMessage = LineMessaging.BuildTemplateMessage;

const LINE_TOKEN = process.env.HUBOT_LINE_TOKEN;

module.exports = function(robot){
  var matcher = function(message){
    var result = false;
    var stickerMsg = message.message;
    if (stickerMsg && stickerMsg.type && stickerMsg.type === 'sticker'){
      if(stickerMsg.stickerId === '1'){
        result = true;
      }
    }
    // Not implement listener, so should CatchAllMessage.message
    console.log("message: ", message);
    console.log("result: ", result);
    return result;
  };

  robot.listen(matcher, function(res){
    console.log('listen');
    var stickerMessage = res.message.message;
    // This line is necessary to prevent error
    res.envelope.message = stickerMessage;
    var sticker = new SendSticker(stickerMessage.stickerId, stickerMessage.packageId);
    res.reply(sticker);
  });

  robot.respond(/hello/i, function(res){
    res.reply('world');
  });

  robot.hear(/hi/i, function(res){
    var text1 = new SendText('第一行');
    var text2 = new SendText('Second Line');
    res.reply(text1, text2);
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

  robot.hear(/confirm/i, function(res){
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

  robot.hear(/carousel/i, function(res){
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
  });
};
