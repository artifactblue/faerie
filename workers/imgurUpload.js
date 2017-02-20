var imgur = require('imgur')
var rssFeed = require('../db/models/rssFeed.js')

rssFeed.readAll(300, 0).then(function(result){
	result.rows.forEach(function(rssFeedEntity){
		if (rssFeedEntity.thumbnail.startsWith("http://")){
			console.log("BEFORE ID: " + rssFeedEntity.id + ", ORIGIN: " + rssFeedEntity.thumbnail);
			imgur.uploadUrl(rssFeedEntity.thumbnail).then(function (json) {
		        var imgurUrl = json.data.link;
		        imgurUrl = imgurUrl.replace(/^http:\/\//i, 'https://');

		        var entity = {
		        	"thumbnail": imgurUrl,
		        	"id": rssFeedEntity.id
		        }

		        rssFeed.updateThumbnail(entity).then(function(updateResult){
		        	console.log("UPLOAD ID: " + rssFeedEntity.id + ", IMGUR: " + json.data.link)
		        })
		    })
		    .catch(function (err) {
		        //console.error(err.message);
		        if (err.message.startsWith("Invalid URL")) {
		        	rssFeed.markAsInvalidURL(rssFeedEntity.id).then(function(result){

		        	})
		        }
		        console.log("ERROR ID: " + rssFeedEntity.id)
		    });
		}
    })
}).catch(function(err){

});


