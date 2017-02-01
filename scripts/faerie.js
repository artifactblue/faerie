"use strict"
var LineMessaging = require('hubot-line-messaging-api')
var StickerMessage = require('hubot-line-messaging-api').StickerMessage
var PostbackMessage = require('hubot-line-messaging-api').PostbackMessage
var SendSticker = LineMessaging.SendSticker
var SendLocation = LineMessaging.SendLocation
var SendImage = LineMessaging.SendImage
var SendVideo = LineMessaging.SendVideo
var SendAudio = LineMessaging.SendAudio
var SendText = LineMessaging.SendText
var rss = require('../db/models/rss.js')
var users = require('../db/models/users.js')
var userSubscription = require('../db/models/userSubscription.js')

// 3rd party libs
var imgur = require('imgur')
var Promise = require('bluebird')
var util = require('util')

// rss feed parser
var FeedParser = require('feedparser')
var request = require('request') // for fetching the feed

var FEED_LIMIT = 3
var DESCRIPTION_LENGTH = 60
var sendImageString = ""

function uploadImages (res, respBody) {
  console.log('uploadImages---1')
  for(var index in respBody){
    var imgUrl = respBody[index].images
    if(index >= 0 && index <= 4)
    imgur.uploadUrl(imgUrl)
        .then(function (json) {
            var imgurUrl = json.data.link
            imgurUrl = imgurUrl.replace(/^http:\/\//i, 'https://')
            // image.push(new SendImage(imgurUrl, imgurUrl))
            // sendImageString = sendImageString + ", new SendImage('" + imgurUrl + "', '" + imgurUrl + "')"
            res.reply(new SendImage(imgurUrl, imgurUrl))
            console.log("?????", imgurUrl)
        })
        .catch(function (err) {
            console.error(err.message)
        })
  }
}

function pushImageByLine (res) {
  console.log('pushImageByLine---2')
  // eval("res.reply(sendImageString)")
}

const BuildTemplateMessage = LineMessaging.BuildTemplateMessage

const LINE_TOKEN = process.env.HUBOT_LINE_TOKEN

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
    var result = false
    var stickerMsg = message.message
    if (stickerMsg && stickerMsg.type && stickerMsg.type === 'sticker'){
      result = true
    }
    var user = message.user
    robot.brain.set('USER:' + user.id, user)
    return result
  }

  /**
   * Filter all postback message
   */ 
  var filterPostback = function(message){
    var result = false
    var postbackMsg = message.message
    if (postbackMsg && postbackMsg.type && postbackMsg.type === 'postback'){
      result = true
      robot.http("https://api.line.me/v2/bot/profile/" + postbackMsg.user.id)
        .header('Authorization', "Bearer " + LINE_TOKEN)
        .get()(function(err, resp, body) {
          var respBody = JSON.parse(body)
          var entity = {id: respBody.userId, displayName: respBody.displayName}
          users.create(entity).then(function(result){
            console.log(respBody.userId + ' updated')
          })
        })
    }
    return result
  }

  /**
   * Do postback action
   */
  robot.listen(filterPostback, function(res){
    var postbackMsg = res.message.message.postback
    console.log(res.message.user.id + ", " + postbackMsg.data)
    var postbackData = postbackMsg.data.split('&')
    var entity = {userId: res.message.user.id}
    postbackData.forEach(function(param){
      var data = param.split('=')
      entity[data[0]] = data[1]
    })

    subscriptionRss(entity)
  })

  /**
   * Reply any sticker message
   */
  robot.listen(filterStickers, function(res){
    var stickerMessage = res.message.message
    // This line is necessary to prevent error
    res.envelope.message = stickerMessage
    var sticker = new SendSticker(stickerMessage.stickerId, stickerMessage.packageId)
    res.reply(sticker)
  })

  /**
   * Get user profile
   */
  robot.hear(/whoami/i, function(res){
    robot.http("https://api.line.me/v2/bot/profile/" + res.message.user.id)
      .header('Authorization', "Bearer " + LINE_TOKEN)
      .get()(function(err, resp, body) {
        var respBody = JSON.parse(body)
        var text1 = new SendText('你好，' + respBody.displayName)
        var text2 = new SendText('使用者ID ' + res.message.user.id)
        res.reply(text1, text2)
      })
  })

  /**
   * Support on this bot
   */
  robot.hear(/help/i, function(res){
    var text1 = new SendText('輸入 [top]，顯示Top 3推薦漫畫')
    var text2 = new SendText('輸入 [list]，顯示訂閱清單')
    var text3 = new SendText('輸入 [whoami]，顯示個人資訊')
    res.reply(text1, text2, text3)
  })

  /**  
   * Get Top 3 rss
   */
  robot.hear(/top/i, function(res){
    // var comicList = comic.readAll().then(function(result){
    //   var msg = buildCarousel("comic recommend", result)
    //   res.reply(msg)
    // })
  })

  /**
   * List all rss subscription
   */
  robot.hear(/list/i, function(res){
    userSubscription.readByUserId(res.message.user.id).then(function(result){
      var msg = buildButton("subscription list", result)
      res.reply(msg)
    })
  })

  robot.hear(/rss/i, function(res){

    // request rss link
    var req = request('http://feeds.feedburner.com/engadget/cstb')
    var feedparser = new FeedParser()
    var feedNumber = 0
    var columns = []

    req.on('error', function (error) {
      // handle any request errors
    })

    req.on('response', function (res) {
      var stream = this // `this` is `req`, which is a stream

      if (res.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'))
      }
      else {
        stream.pipe(feedparser)
      }
    })

    feedparser.on('error', function (error) {
      // always handle errors
    })

    feedparser.on('meta', function (meta) {
      console.log('===== %s =====', meta.title)
    })

    feedparser.on('readable', function () {
      // This is where the action is!
      var stream = this // `this` is `feedparser`, which is a stream
      var meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
      var item

      while (item = stream.read()) {
        console.log('Got article: %s', item.title || item.description)

        var description = item.description
        var imgUrl = "https" + description.match(/:\/\/[^">]+/g)
        // remove html tag
        var clearDescription = description.replace(/<\/?[^>]+(>|$)/g, "")
        // substring by length
        if (clearDescription.length > DESCRIPTION_LENGTH) {
          var trimDescription = clearDescription.substring(0, DESCRIPTION_LENGTH - 3 ) + '...'
        } else {
          var trimDescription = clearDescription
        }

        var feedLink = item.link
        feedLink = feedLink.replace(/^http:\/\//i, 'https://')
        console.log('Got clearDescription: %s', trimDescription)

        var carousel = {
          "thumbnailImageUrl": imgUrl,
          "title": item.title,
          "text": trimDescription,
          // "text": "abc",
          "actions": [
            {
              "type": "uri",
              "label": "線上觀看",
              "uri": feedLink
            },
            {
              "type": "postback",
              "label": "訂閱",
              "data": "status=1&comicId=1"
            }
          ]
        }
        if (feedNumber < FEED_LIMIT) {
          columns.push(carousel)
        } else if (feedNumber === FEED_LIMIT) {
          var obj = {
            "type": "template",
            "altText": "Engadget",
            "template": {
                "type": "carousel",
                "columns": columns
            }
          }
          // console.log('columns!!!!!', util.inspect(columns, false, null))
          res.reply(obj)
          // _res.reply(obj)
        }
        feedNumber++
      }
    })
  })

  robot.hear(/a/i, function(res) {
    var btntemp = {
      "type": "template",
      "altText": "this is a buttons template",
      "template": {
          "type": "buttons",
          "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
          "title": "Menu",
          "text": "Please select",
          "actions": [
              {
                "type": "postback",
                "label": "Buy",
                "data": "action=buy&itemid=123"
              },
              {
                "type": "postback",
                "label": "Add to cart",
                "data": "action=add&itemid=123"
              },
              {
                "type": "uri",
                "label": "View detail",
                "uri": "http://example.com/page/123"
              }
          ]
      }
    }

    var carouselTemp = {
      "type": "template",
      "altText": "this is a carousel template",
      "template": {
          "type": "carousel",
          "columns": [
              {
                "thumbnailImageUrl": "https://example.com/bot/images/item1.jpg",
                "title": "this is menu",
                "text": "description",
                "actions": [
                    {
                        "type": "postback",
                        "label": "Buy",
                        "data": "action=buy&itemid=111"
                    },
                    {
                        "type": "postback",
                        "label": "Add to cart",
                        "data": "action=add&itemid=111"
                    },
                    {
                        "type": "uri",
                        "label": "View detail",
                        "uri": "http://example.com/page/111"
                    }
                ]
              },
              {
                "thumbnailImageUrl": "https://example.com/bot/images/item2.jpg",
                "title": "this is menu",
                "text": "description",
                "actions": [
                    {
                        "type": "postback",
                        "label": "Buy",
                        "data": "action=buy&itemid=222"
                    },
                    {
                        "type": "postback",
                        "label": "Add to cart",
                        "data": "action=add&itemid=222"
                    },
                    {
                        "type": "uri",
                        "label": "View detail",
                        "uri": "http://example.com/page/222"
                    }
                ]
              }
          ]
      }
    }
    res.reply(carouselTemp)
  })

  /**
   * push notification
   */
  robot.hear(/push/i, function(res){
    pushMessage('U33823165fc452e43a0a66ad60fba52bf', "通知")
    res.reply(new SendText('通知服務'))
  })

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
    })
    robot.http("https://api.line.me/v2/bot/message/push")
      .header('Authorization', "Bearer " + LINE_TOKEN)
      .header('Content-Type', 'application/json')
      .post(postData)(function(err, resp, body) {
        console.log(err, resp, body)
      })
  }

  /**
   * Build comic carousel
   */
  function buildCarousel(altText, result) {
    var columns = []
    result.rows.forEach(function(data){
      var carousel = {
        "thumbnailImageUrl": data.thumbnail,
        "title": data.comicname,
        "text": data.lastvolnumber,
        "actions": [
          {
            "type": "uri",
            "label": "線上觀看",
            "uri": "https://github.com/Ksetra/faerie"
          },
          {
            "type": "postback",
            "label": "訂閱[" + data.comicname + "]",
            "data": "status=" + userSubscription.SUBSCRIBE + "&comicId=" + data.id
          }
        ]
      }
      columns.push(carousel)
    })
    var obj = {
      "type": "template",
      "altText": altText,
      "template": {
          "type": "carousel",
          "columns": columns
      }
    }
    return obj
  }

  function buildButton(altText, result) {
    var actions = []
    result.rows.forEach(function(data){
      var action = {
        "type": "postback",
        "label": "取消訂閱[" + data.comicname + "]",
        "data": "status=" + userSubscription.UNSUBSCRIBE + "&comicId=" + data.id
      }
      actions.push(action)
    })
    var obj = {
      "type": "template",
      "altText": altText,
      "template": {
          "type": "buttons",
          "thumbnailImageUrl": "https://s-media-cache-ak0.pinimg.com/736x/a3/09/06/a309069d76b596b51baa60d6c526cb94.jpg",
          "title": "訂閱清單",
          "text": "點選取消訂閱",
          "actions": actions
      }
    }
    return obj
  }

  /**
   * Do subscribe
   */
  function subscriptionRss(entity) {
    if (entity.status == userSubscription.SUBSCRIBE) {
      userSubscription.create(entity).then(function(result){
        rss.read(entity.rssId).then(function(rssResult){
          if (rssResult.rowCount > 0) {
            pushMessage(entity.userId, "[" + rssResult.rows[0].rssname + "] 訂閱完成")
          }
        })
      }).catch(function(err){
        console.log(err)
      })
    } else if (entity.status = userSubscription.UNSUBSCRIBE) {
      userSubscription.update(entity).then(function(result){
        rss.read(entity.rssId).then(function(rssResult){
          if (comicResult.rowCount > 0) {
            pushMessage(entity.userId, "[" + rssResult.rows[0].rssname + "] 已取消訂閱")
          }
        })
      }).catch(function(err){
        console.log(err)
      })
    }
  }
}
