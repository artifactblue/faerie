var pool = require('../dbConnectionPool.js')

function UserSubscription() {}

UserSubscription.prototype.SUBSCRIBE = 'SUBSCRIBE'
UserSubscription.prototype.PENDING = 'PENDING'
UserSubscription.prototype.UNSUBSCRIBE = 'UNSUBSCRIBE'

UserSubscription.prototype.readByUserId = function(id, limit = 3) {
    return pool.query('SELECT * FROM userSubscription'
    	+ ' LEFT JOIN category ON userSubscription.categoryId = category.id WHERE userSubscription.status = $1 AND userSubscription.userId = $2 ORDER BY userSubscription.id LIMIT $3', 
    	[UserSubscription.prototype.SUBSCRIBE, id, limit])
}

UserSubscription.prototype.check = function(entity) {
	return pool.query('SELECT * FROM userSubscription WHERE userId = $1 AND categoryId = $2 AND status = $3',
		[entity.userId, entity.categoryId, entity.status]);
}

UserSubscription.prototype.create = function(entity) {
	return pool.query('INSERT INTO userSubscription (UserId, CategoryId, Status, CreateTimestamp) '
		+ ' SELECT $1, $2, $3, now() '
		+ ' WHERE NOT EXISTS (SELECT 1 FROM userSubscription WHERE UserId = $4 AND CategoryId = $5 AND Status = $6)', 
		[entity.userId, entity.categoryId, entity.status, entity.userId, entity.categoryId, entity.status])
}

UserSubscription.prototype.update = function(entity) {
	return pool.query('UPDATE userSubscription SET status = $1, CreateTimestamp = now() WHERE userId = $2 and categoryId = $3',
		[entity.status, entity.userId, entity.categoryId])
}

UserSubscription.prototype.loadUnpushedCategory = function(entity) {
	return pool.query('SELECT userSubscription.* FROM userSubscription '
		+ ' LEFT JOIN rss ON userSubscription.categoryId = rss.categoryId '
		+ ' WHERE userSubscription.lastUpdateTimestamp < rss.lastUpdateTimestamp')
}

UserSubscription.prototype.updatePushedCategory = function(entity) {
	return pool.query('UPDATE userSubscription SET lastUpdateTimestamp = now() WHERE userId = $1 AND categoryId = $2',
		[entity.userId, entity.categoryId])
}

exports = module.exports = new UserSubscription()
