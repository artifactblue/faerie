"use strict";
var LineMessaging = require('hubot-line-messaging');
var SendSticker = LineMessaging.SendSticker;
var SendLocation = LineMessaging.SendLocation;
var SendImage = LineMessaging.SendImage;
var SendVideo = LineMessaging.SendVideo;
var SendAudio = LineMessaging.SendAudio;
var SendText = LineMessaging.SendText;

const BuildTemplateMessage = LineMessaging.BuildTemplateMessage;

const LINE_TOKEN = process.env.HUBOT_LINE_TOKEN;

module.exports = function(robot){
  robot.respond(/hello/i, function(res){
    res.reply('world');
  });

  robot.hear(/hi/i, function(res){
    var text1 = new SendText('第一行');
    var text2 = new SendText('Second Line');
    res.reply(text1, text2);
  });

  robot.hear(/template/i, function(res){
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
};
