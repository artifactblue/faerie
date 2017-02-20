var pool = require('../dbConnectionPool.js')


function RssFeed() {}

RssFeed.prototype.read = function(id) {
    return pool.query('SELECT * FROM RssFeed WHERE id = $1', [id])
}

RssFeed.prototype.readAll = function(limit = 3, offset = 0) {
	var limitSQL = ""
	if (limit > -1) {
		limitSQL += " LIMIT " + limit + " OFFSET " + offset
	}
    return pool.query('SELECT * FROM RssFeed WHERE Status = true ORDER BY id' + limitSQL)
}

RssFeed.prototype.create = function(entity) {
	// TODO should check if exists
	return pool.query('INSERT INTO RssFeed (RssId, RssFeedTitle, RssFeedUrl, ReleaseDate, Thumbnail, RssFeedContent, CreateTimestamp) '
		+ ' VALUES ($1, $2, $3, $4, $5, $6, now())',
		[entity.rssId, entity.rssFeedTitle, entity.rssFeedUrl, entity.releaseDate, entity.thumbnail, entity.rssFeedContent]);
}

RssFeed.prototype.loadUnpushRssFeed = function(entity) {
	return pool.query('SELECT rssfeed.* FROM rss '
		+ ' LEFT JOIN rssFeed ON rss.id = rssFeed.rssid '
		+ ' WHERE rss.categoryId = $1 AND rssFeed.createTimestamp > $2 AND rssFeed.status = true'
		+ ' AND rssFeed.thumbnail LIKE \'https%\' LIMIT $3',
		[entity.categoryId, entity.lastUpdateTimestamp, entity.limit]);
}

RssFeed.prototype.update = function(entity) {

}

RssFeed.prototype.updateThumbnail = function(entity) {
	return pool.query('UPDATE RssFeed SET thumbnail = $1 WHERE id = $2',
		[entity.thumbnail, entity.id]);
}

RssFeed.prototype.markAsInvalidURL = function(id) {
	return pool.query('UPDATE RssFeed SET status = false WHERE id = $1', 
		[id]);
}

exports = module.exports = new RssFeed()
