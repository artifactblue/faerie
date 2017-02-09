var request = require('request')

var LINE_TOKEN = process.env.HUBOT_LINE_TOKEN

var user = "U33823165fc452e43a0a66ad60fba52bf"
var message = 
{ type: 'template',
  altText: 'altText',
  template:
   { type: 'carousel',
     columns:
      [ { thumbnailImageUrl: 'https://a305020.pixnet.net/album/photo/146740077',
          title: '堀井美月寫真(89P)',
          text: '{"title":"堀井美月寫真(...',
          actions:
           [ { type: 'uri',
               label: '瀏覽',
               uri: 'http://www.artifactblue.com/i/2/4' } ] },
        { thumbnailImageUrl: 'https://a305020.pixnet.net/album/photo/147331614',
          title: '石坂千尋 寫真',
          text: '{"title":"石坂千尋 寫真...',
          actions:
           [ { type: 'uri',
               label: '瀏覽',
               uri: 'http://www.artifactblue.com/i/2/4' } ] },
        { thumbnailImageUrl: 'https://i.imgur.com/dsECxwV.jpg',
          title: '還有更多資訊，千萬別錯過',
          text: 'Read More...',
          actions:
           [ { type: 'uri',
               label: '查看更多資訊',
               uri: 'http://www.artifactblue.com' } ] } ] } };

var messages = []
var text = {"type":"text","text":"text"}
messages.push(message)

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

pushMessage(user, messages)

