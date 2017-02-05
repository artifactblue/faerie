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
var category = require('../db/models/category.js')
var BuildTemplateMessage = LineMessaging.BuildTemplateMessage

// 3rd party libs
var imgur = require('imgur')
var Promise = require('bluebird')
var util = require('util')

// RSS feed parser
var FeedParser = require('feedparser')
var request = require('request') // for fetching the feed

// Gobal param
var FEED_LIMIT = 3
var DESCRIPTION_LENGTH = 60
var sendImageString = ""

var {
  SUBSCRIBE,
  UNSUBSCRIBE,
} = userSubscription

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

function uploadImages(res, respBody) {
  for (var index in respBody) {
    var imgUrl = respBody[index].images
    if (index >= 0 && index <= 4)
      imgur.uploadUrl(imgUrl)
        .then(function (json) {
          var imgurUrl = json.data.link
          imgurUrl = imgurUrl.replace(/^http:\/\//i, 'https://')
          // image.push(new SendImage(imgurUrl, imgurUrl))
          // sendImageString = sendImageString + ", new SendImage('" + imgurUrl + "', '" + imgurUrl + "')"
          res.reply(new SendImage(imgurUrl, imgurUrl))
        })
        .catch(function (err) {
          console.error(err.message)
        })
  }
}

module.exports = function (robot) {
  var LINE_TOKEN = process.env.HUBOT_LINE_TOKEN
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
  var filterStickers = function (message) {
    var result = false
    var stickerMsg = message.message
    if (stickerMsg && stickerMsg.type && stickerMsg.type === 'sticker') {
      result = true
    }
    var user = message.user
    //robot.brain.set('USER:' + user.id, user)
    return result
  }

  /**
   * Filter all postback message
   */
  var filterPostback = function (message) {
    var result = false
    var postbackMsg = message.message
    if (postbackMsg && postbackMsg.type && postbackMsg.type === 'postback') {
      result = true
      robot.http("https://api.line.me/v2/bot/profile/" + postbackMsg.user.id)
        .header('Authorization', "Bearer " + LINE_TOKEN)
        .get()(function (err, resp, body) {
          var respBody = JSON.parse(body)
          var entity = { id: respBody.userId, displayName: respBody.displayName }
          users.create(entity).then(function (result) {
            console.log(respBody.userId + ' updated')
          })
        })
    }
    return result
  }

  /**
   * Do postback action
   */
  robot.listen(filterPostback, function (res) {
    var postbackMsg = res.message.message.postback
    console.log(res.message.user.id + ", " + postbackMsg.data)
    var postbackData = postbackMsg.data.split('&')
    var entity = { userId: res.message.user.id }
    postbackData.forEach(function (param) {
      var data = param.split('=')
      entity[data[0]] = data[1]
    })

    console.log('entity: ', entity)
    if (entity.action === 'subscription' && entity.categoryId) {
      subscriptionCategory(entity)
    }
    if (entity.action === 'top') {
      categoryPage(entity);
    }
    // if (entity.categoryId) {
    //   // TODO show rss feed list
    //   // console.log('#1 getRssLinks', res, entity)
    //   getRssLinks(entity);
    // }
  })

  /**
   * Reply any sticker message
   */
  robot.listen(filterStickers, function (res) {
    var stickerMessage = res.message.message
    // This line is necessary to prevent error
    res.envelope.message = stickerMessage
    var sticker = new SendSticker(stickerMessage.stickerId, stickerMessage.packageId)
    res.reply(sticker)
  })

  /**
   * Get user profile
   */
  robot.hear(/whoami/i, function (res) {
    robot.http("https://api.line.me/v2/bot/profile/" + res.message.user.id)
      .header('Authorization', "Bearer " + LINE_TOKEN)
      .get()(function (err, resp, body) {
        var respBody = JSON.parse(body)
        var text1 = new SendText('你好，' + respBody.displayName)
        var text2 = new SendText('使用者ID ' + res.message.user.id)
        res.reply(text1, text2)
      })
  })

  /**
   * Support on this bot
   */
  robot.hear(/help/i, function (res) {
    var text1 = new SendText('輸入 [top]，顯示 Top 3 推薦類別')
    var text2 = new SendText('輸入 [list]，顯示訂閱清單')
    var text3 = new SendText('輸入 [whoami]，顯示個人資訊')
    res.reply(text1, text2, text3)
  })

  /**  
   * Get Top 3 rss
   */
  robot.hear(/top/i, function (res) {
    var categoryList = category.readAll().then(function (result) {
      console.log('top rowCount: ', result.rowCount)
      category.all().then(function(categoryResult) {
        var readMore = {
          "page": true,
          "offset": 0,
          "limit": 3,
          "total": categoryResult.rows[0].total
        }
        var msg = buildCarousel("category recommend", result, readMore)
        res.reply(msg)
      })
    })
  })

  /**
   * List all rss subscription
   */
  robot.hear(/list/i, function (res) {
    userSubscription.readByUserId(res.message.user.id).then(function (result) {
      var msg = buildButton("subscription list", result)
      res.reply(msg)
    })
  })

  /**
   * get rss feeds
   */
  robot.hear(/rss/i, function (res) {
    // var rssUrl = 'http://feeds.feedburner.com/engadget/cstb'
    var rssUrl = 'http://a305020.pixnet.net/blog/feed/rss'
    var limit = FEED_LIMIT
    var offset = 3
    getRssFeeds(res, rssUrl, limit, offset)
  })

  robot.hear(/a/i, function (res) {
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

    res.reply(carouselTemp)
  })

  /**
   * push notification
   */
  robot.hear(/push/i, function (res) {
    var message = [
      {
        "type": "text",
        "text": "通知"
      }
    ]
    pushMessage('U33823165fc452e43a0a66ad60fba52bf', message)
    res.reply(new SendText('通知服務'))
  })

  /**
   * Push message API
   */
  function pushMessage(user, message) {
    var postData = JSON.stringify({
      "to": user,
      "messages": message
    })
    robot.http("https://api.line.me/v2/bot/message/push")
      .header('Authorization', "Bearer " + LINE_TOKEN)
      .header('Content-Type', 'application/json')
      .post(postData)(function (err, resp, body) {
        console.log(err, resp, body)
      })
  }

  function categoryPage(entity) {
    var categoryList = category.readAll(entity.limit, entity.offset).then(function (result) {
      category.all().then(function(categoryResult) {
        var readMore = {
          "page": true,
          "offset": entity.offset,
          "limit": entity.limit,
          "total": categoryResult.rows[0].total
        }
        var msg = [
          buildCarousel("category recommend", result, readMore)
        ]
        pushMessage(entity.userId, msg)
      })
    })
  }

  /**
   * Build rss carousel
   */
  function buildCarousel(altText, result, readMore) {
    var columns = []
    result.rows.forEach(function (data) {
      var carousel = {
        "thumbnailImageUrl": data.thumbnail,
        "title": data.name,
        "text": data.name,
        "actions": [
          {
            "type": "uri",
            "label": "瀏覽[" + data.name + "]",
            "uri": data.categoryurl
          }, {
            "type": "postback",
            "label": "訂閱[" + data.name + "]",
            "data": "action=subscription&status=" + SUBSCRIBE + "&categoryId=" + data.id
          }
        ]
      }
      columns.push(carousel)
    })
    if (readMore.page) {
      var actions = []
      //var prevOffset = parseInt(readMore.offset, 10) - 3
      var nextOffset = parseInt(readMore.offset, 10) + 3
      // var prev = {
      //   "type": "postback",
      //   "label": "上一頁",
      //   "data": "action=top&limit=" + readMore.limit + "&offset=" + prevOffset
      // }
      var uri = {
        "type": "uri",
        "label": "查看完整分類清單",
        "uri": "https://i.imgur.com/dsECxwV.jpg"
      }
      actions.push(uri);
      var next = {
        "type": "postback",
        "label": "下一頁",
        "data": "action=top&limit=" + readMore.limit + "&offset=" + nextOffset
      }
      // if (prevOffset > 0) {
      //   actions.push(prev)
      // }
      if (nextOffset < readMore.total) {
        actions.push(next)
      } else {
        var final = {
          "type": "postback",
          "label": "下面沒有了，重頭開始？",
          "data": "action=top&limit=" + readMore.limit + "&offset=0"
        }
        actions.push(final)
      }

      var moreCarousel = {
        "thumbnailImageUrl": "https://i.imgur.com/dsECxwV.jpg",
        "title": "畫面上沒有你心儀的分類嗎？沒關係，讓我們繼續看下去",
        "text": "Read More...",
        "actions": actions
      }
      console.log(actions.length)
      if (actions.length == 2) {
        columns.push(moreCarousel)
      }
    }
    var obj = {
      "type": "template",
      "altText": altText,
      "template": {
        "type": "carousel",
        "columns": columns
      }
    }
    console.log(util.inspect(obj, false, null));
    return obj
  }

  function buildCarouselByCategory(altText, result) {
    // console.log('#2', altText, result)
    var columns = []
    result.rows.forEach(function (data) {
      var carousel = {
        // "thumbnailImageUrl": data.thumbnail,
        "thumbnailImageUrl": "https://i.imgur.com/dsECxwV.jpg",
        "title": data.rssname,
        "text": data.rssname,
        "actions": [
          {
            "type": "postback",
            "label": "顯示[" + data.rssname + "]",
            "data": "limit=3&offset=0&rssId=" + data.id
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
    // console.log('#3', util.inspect(obj, false, null))
    return obj
  }

  function buildButton(altText, result) {
    var actions = []
    result.rows.forEach(function (data) {
      var action = {
        "type": "postback",
        "label": "取消訂閱[" + data.name + "]",
        "data": "action=subscription&status=" + UNSUBSCRIBE + "&categoryId=" + data.id
      }
      actions.push(action)
    })
    var obj = {
      "type": "template",
      "altText": altText,
      "template": {
        "type": "buttons",
        "thumbnailImageUrl": "https://vignette4.wikia.nocookie.net/bladesandbeasts/images/8/84/Faerie_Dragon.png/revision/latest?cb=20121005191231",
        "title": "訂閱清單",
        "text": "點選取消訂閱",
        "actions": actions
      }
    }
    return obj
  }

  function subscriptionCategory(entity) {
    console.log('subscriptionCategory: ', entity)
    if (entity.status === SUBSCRIBE) {
      userSubscription.check(entity).then(function(checkResult) {
        if (checkResult.rowCount > 0) {
          var message = [
            {
              "type": "text",
              "text": "您已經訂閱過此分類"
            }
          ]
          pushMessage(entity.userId, message)
        } else {
          userSubscription.create(entity).then(function (result) {
            category.read(entity.categoryId).then(function (categoryResult) {
              if (categoryResult.rowCount > 0) {
                var categoryResultData = categoryResult.rows[0];
                var message = [
                  {
                    "type": "text",
                    "text": "[" + categoryResultData.name + "] 訂閱完成"
                  }
                ]
                pushMessage(entity.userId, message)
              }
            })
          }).catch(function (err) {
            console.log(err)
          })
        }
      })
    } else if (entity.status = UNSUBSCRIBE) {
      userSubscription.check(entity).then(function(checkResult) {
        if (checkResult.rowCount > 0) {
          var message = [
            {
              "type": "text",
              "text": "您尚未訂閱此分類"
            }
          ]
          pushMessage(entity.userId, message)
        } else {
          userSubscription.update(entity).then(function (result) {
            category.read(entity.categoryId).then(function (categoryResult) {
              if (categoryResult.rowCount > 0) {
                var categoryResultData = categoryResult.rows[0];
                var message = [
                  {
                    "type": "text",
                    "text": "[" + categoryResultData.name + "] 已取消訂閱"
                  }
                ]
                pushMessage(entity.userId, message)
              }
            })
          }).catch(function (err) {
            console.log(err)
          })
        }
      })
    }
  }

  /**
   * Do subscribe
   */
  // function subscriptionRss(entity) {
  //   console.log('subscriptionRss: ', entity)
  //   if (entity.status == SUBSCRIBE) {
  //     userSubscription.create(entity).then(function (result) {
  //       rss.read(entity.rssId).then(function (rssResult) {
  //         if (rssResult.rowCount > 0) {
  //           var rssResultData = rssResult.rows[0];
  //           var message = [
  //             {
  //               "type": "text",
  //               "text": "[" + rssResultData.rssname + "] 訂閱完成"
  //             }
  //           ]
  //           pushMessage(entity.userId, message)
  //         }
  //       })
  //     }).catch(function (err) {
  //       console.log(err)
  //     })
  //   } else if (entity.status = UNSUBSCRIBE) {
  //     userSubscription.update(entity).then(function (result) {
  //       rss.read(entity.rssId).then(function (rssResult) {
  //         if (rssResult.rowCount > 0) {
  //           var rssResultData = rssResult.rows[0];
  //           var message = [
  //             {
  //               "type": "text",
  //               "text": "[" + rssResultData.rssname + "] 已取消訂閱"
  //             }
  //           ]
  //           pushMessage(entity.userId, message)
  //         }
  //       })
  //     }).catch(function (err) {
  //       console.log(err)
  //     })
  //   }
  // }

  function getRssLinks(entity) {
    rss.readByCategoryId(entity.categoryId, entity.limit, entity.offset).then(function (result) {
      var message = [
        buildCarouselByCategory("rss list", result)
      ]
      pushMessage(entity.userId, message)
    })
  }

  function getRssFeeds(res, rssUrl, limit, offset) {
    // request rss link
    var req = request(rssUrl)
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
          var trimDescription = clearDescription.substring(0, DESCRIPTION_LENGTH - 3) + '...'
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
          "actions": [
            {
              "type": "uri",
              "label": "線上觀看",
              "uri": feedLink
            },
            {
              "type": "postback",
              "label": "訂閱",
              "data": "status=" + SUBSCRIBE + "&rssId=1"
            }
          ]
        }
        if (feedNumber > offset && feedNumber <= offset + limit) {
          // console.log('*************\n', util.inspect(item, false, null))
          columns.push(carousel)
        }

        if (feedNumber === offset + limit) {
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
        }
        feedNumber++
      }
    })
  }
}
