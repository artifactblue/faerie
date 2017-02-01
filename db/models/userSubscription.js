var pool = require('../dbConnectionPool.js')

function UserSubscription() {}

UserSubscription.prototype.SUBSCRIBE = 'SUBSCRIBE'
UserSubscription.prototype.PENDING = 'PENDING'
UserSubscription.prototype.UNSUBSCRIBE = 'UNSUBSCRIBE'

UserSubscription.prototype.readByUserId = function(id, limit = 3) {
    return pool.query('SELECT * FROM userSubscription'
    	+ ' LEFT JOIN rss ON userSubscription.rssId = rss.id WHERE status = $1 AND userId = $2 LIMIT $3', 
    	[UserSubscription.prototype.SUBSCRIBE, id, limit])
}

UserSubscription.prototype.create = function(entity) {
	return pool.query('INSERT INTO userSubscription (UserId, RssId, Status, CreateTimestamp) '
		+ ' SELECT $1, $2, $3, now() '
		+ ' WHERE NOT EXISTS (SELECT 1 FROM userSubscription WHERE UserId = $4 AND RssId = $5 AND Status = $6)'
		, 
		[entity.userId, entity.rssId, entity.status, entity.userId, entity.rssId, entity.status])
}

UserSubscription.prototype.update = function(entity) {
	return pool.query('UPDATE userSubscription SET status = $1, CreateTimestamp = now() WHERE userId = $2 and rssId = $3',
		[entity.status, entity.userId, entity.rssId])
}

exports = module.exports = new UserSubscription()
