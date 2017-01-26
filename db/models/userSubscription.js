var pool = require('../dbConnectionPool.js');

function UserSubscription() {}

UserSubscription.prototype.SUBSCRIBE = 'SUBSCRIBE';
UserSubscription.prototype.PENDING = 'PENDING';
UserSubscription.prototype.UNSUBSCRIBE = 'UNSUBSCRIBE';

UserSubscription.prototype.readByUserId = function(id, limit = 3) {
    return pool.query('SELECT * FROM userSubscription LEFT JOIN comic ON userSubscription.comicId = comic.id WHERE userId = $1 LIMIT $2', [id, limit]);
};

UserSubscription.prototype.create = function(entity) {
	return pool.query('INSERT INTO userSubscription (UserId, ComicId, Status, CreateTimestamp) '
		+ ' SELECT $1, $2, $3, now() '
		+ ' WHERE NOT EXISTS (SELECT 1 FROM userSubscription WHERE UserId = $4 AND ComicId = $5 AND Status = $6)'
		, 
		[entity.userId, entity.comicId, entity.status, entity.userId, entity.comicId, entity.status]);
}

UserSubscription.prototype.update = function(entity) {
	return pool.query('UPDATE userSubscription SET status = $1, CreateTimestamp = now() WHERE userId = $2 and comicId = $3',
		[entity.status, entity.userId, entity.comicId]);
}

exports = module.exports = new UserSubscription();