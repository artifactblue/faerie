var userSubscription = require('../db/models/userSubscription.js')
var request = require('request')

var LINE_TOKEN = process.env.HUBOT_LINE_TOKEN

function rec() {
	setTimeout(function(){ 
		console.log(new Date())

		userSubscription.loadUnpushedCategory().then(function(userSubscriptionResult){ 
			console.log(userSubscriptionResult.rowCount);
			if (userSubscriptionResult.rowCount > 0) {
				var message = []
				userSubscriptionResult.rows.forEach(function(userSubscriptionResultData){
					// send push message
					message.push(buildButtons(userSubscriptionResultData.categoryid));
				})
				//pushMessage('U33823165fc452e43a0a66ad60fba52bf', message)
				pushMessage(userSubscriptionResultData.userid, message)
				var entity = {
					"userId": userSubscriptionResultData.userid,
					"categoryId": userSubscriptionResultData.categoryid
				}
				userSubscription.updatePushedCategory(entity).then(function(result){
					console.log('Schedule updated, userId: ' + entity.userId + ', categoryId: ' + entity.categoryId)
				})
			}
		})
		rec()
	}, 60000)	
}

rec()

function buildButtons(categoryId) {
	// TODO load RssFeed and build template
	return {"type": "text", "text": categoryId}
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
    console.log(err, resp, body)
  })
}
