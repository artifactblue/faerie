var pool = require('../dbConnectionPool.js');

function UserSubscription() {}

UserSubscription.prototype.readByUserId = function(id) {
    return pool.query('SELECT * FROM userSubscription WHERE userId = $1', [id]);
};

UserSubscription.prototype.create = function(entity) {
	return pool.query('REPLACE INTO userSubscription (UserId, ComicId, Status, CreateTimestamp) VALUES ($1, $2, $3, now())', 
		[entity.userId, entity.comicId, entity.status]);
}

UserSubscription.prototype.update = function(entity) {
	
}

exports = module.exports = new UserSubscription();