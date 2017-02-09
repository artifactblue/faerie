var pool = require('../dbConnectionPool.js')


function RssFeed() {}

RssFeed.prototype.read = function(id) {
    return pool.query('SELECT * FROM RssFeed WHERE id = $1', [id])
}

RssFeed.prototype.readAll = function(limit = 3, offset = 0) {
    return pool.query('SELECT * FROM RssFeed ORDER BY id LIMIT ' + limit + ' OFFSET ' + offset)
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
		+ ' WHERE rss.categoryId = $1 and rssFeed.createTimestamp > $2',
		[entity.categoryId, entity.lastUpdateTimestamp]);
}

RssFeed.prototype.update = function(entity) {

}

exports = module.exports = new RssFeed()
