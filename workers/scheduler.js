var userSubscription = require('../db/models/userSubscription.js')
var rss = require('../db/models/rss.js')
var rssFeed = require('../db/models/rssFeed.js')
var request = require('request')
var util = require('util')

var FEED_LIMIT = 3
var LINE_TOKEN = process.env.HUBOT_LINE_TOKEN
var TIMEOUT = 5000
var DESCRIPTION_LENGTH = 20
var HOST_NAME = "http://www.artifactblue.com"

function rec() {
	setTimeout(function(){ 
		console.log(new Date())
		userSubscription.loadUnpushedCategory().then(function(userSubscriptionResult){ 
			if (userSubscriptionResult.rowCount > 0) {
				
				// var promises = []
				userSubscriptionResult.rows.forEach(function(userSubscriptionResultData){
					// send push message
					//promises.push(new Promise(function(resolve, reject) {
						loadCategory(userSubscriptionResultData.categoryid, userSubscriptionResultData.lastupdatetimestamp).then(function(result){
							var messages = []
					
							messages.push(result);
							var entity = {
								"userId": userSubscriptionResultData.userid,
								"categoryId": userSubscriptionResultData.categoryid
							};
							console.log('[PUSHMESSAGE] userid: ' + userSubscriptionResultData.userid + ', categoryid: ' + userSubscriptionResultData.categoryid)
							//pushMessage(userSubscriptionResultData.userid, messages)
							userSubscription.updatePushedCategory(entity).then(function(result){
								if (messages.length > 0){
									pushMessage(userSubscriptionResultData.userid, messages)
								}
								console.log('[SCHEDULE] Updated, userId: ' + entity.userId + ', categoryId: ' + entity.categoryId)
							}).catch(function(err){
								console.log('[ERROR] userSubscription.updatePushedCategory failed, userid: ' + userSubscriptionResultData.userid + ', categoryid: ' + userSubscriptionResultData.categoryid)
							})
						}).catch(function(err){
							console.log('[ERROR] loadCategory failed, userid: ' + userSubscriptionResultData.userid + ', categoryid: ' + userSubscriptionResultData.categoryid)
						})
						
						//resolve()
					//}))
				})
				// Promise.all(promises).then(() => { 
				// 	//console.log('messages: ', messages)
				// 	if (messages.length > 0){
				// 		console.log('length: ', messages.length)
				// 		//pushMessage(userSubscriptionResultData.userid, resultMessages)
				// 	}
				// })
				// TODO 這邊要類似 promises 作法
				// if (resultMessages.length > 0){
				// 	pushMessage(userSubscriptionResultData.userid, resultMessages)
				// }
			}
		})
		rec()
	}, TIMEOUT)	
}

rec()

function buildCarousel(categoryId, result) {
	var altText = ""
    var columns = []
    result.rows.forEach(function (data) {
      var carousel = {
        "thumbnailImageUrl": data.thumbnail.split(",")[0],
        "title": data.rssfeedtitle,
        "text": data.description.substring(0, DESCRIPTION_LENGTH - FEED_LIMIT) + '...',  // TODO data.description
        "actions": [
          {
            "type": "uri",
            "label": "瀏覽",
            "uri": "http://www.artifactblue.com/i/" + categoryId + "/" + data.rssid + "/" + data.id
          }
        ]
      }
      columns.push(carousel)
      altText += data.rssfeedtitle + ": \r\n" + 
      			"http://www.artifactblue.com/i/" + categoryId + "/" + data.rssid + "/" + data.id + "\r\n\r\n"
    })

    var moreCarousel = {
        "thumbnailImageUrl": "https://i.imgur.com/dsECxwV.jpg",
        "title": "還有更多資訊，千萬別錯過",
        "text": "Read More...",
        "actions": [
        	{
		        "type": "uri",
		        "label": "查看更多資訊",
		        "uri": HOST_NAME
	      	}
        ]
    }
    columns.push(moreCarousel)
    // TODO make altText better
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

function buildButtons(result) {
	var actions = []
    result.rows.forEach(function (data) {
      var action = {
        "type": "postback",
        "label": "取消訂閱" + data.name + "",
        "data": "action=subscription&status=" + UNSUBSCRIBE + "&categoryId=" + data.id
      }
      actions.push(action)
    })
    // TODO make altText better
    var obj = {
      "type": "template",
      "altText": "",
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

function loadCategory(categoryId, lastUpdateTimestamp) {
	return new Promise(function(resolve, reject){
		var entity = {
			"categoryId": categoryId,
			"lastUpdateTimestamp": lastUpdateTimestamp,
			"limit": FEED_LIMIT
		}
		rssFeed.loadUnpushRssFeed(entity).then(function(rssResult){
			if (rssResult.rowCount > 0) {
				resolve( buildCarousel(categoryId, rssResult) );
			} else {
				console.log('Empty RssFeed, categoryid: ' + categoryid)
				reject()
			}
		}).catch(function(err){
			//console.log('[ERROR] rssFeed.loadUnpushRssFeed failed')
		})
	})
}

function pushMessage(user, message) {
  var postData = {
    "to": user,
    "messages": message
  }
  request.post({
    uri: "https://api.line.me/v2/bot/message/push",
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      'bearer': LINE_TOKEN
    },
    json: true,
    body: postData
  }, function(err, resp, body){
    console.log(body)
  })
}