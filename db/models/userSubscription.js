var pool = require('../dbConnectionPool.js');

function UserSubscription() {}

UserSubscription.prototype.readByUserId = function(id) {
    return pool.query('SELECT * FROM userSubscription WHERE userId = $1', [id]);
};

UserSubscription.prototype.create = function(entity) {
	return pool.query('INSERT INTO userSubscription (UserId, ComicId, Status, CreateTimestamp) VALUES ($1, $2, $3, now())'
		// + 'ON CONFLICT (UserId, ComicId) DO NOTHING'
		, 
		[entity.userId, entity.comicId, entity.status]);
}

UserSubscription.prototype.update = function(entity) {
	
}

exports = module.exports = new UserSubscription();

/*

INSERT INTO userSubscription (UserId, ComicId, Status, CreateTimestamp) VALUES ('U33823165fc452e43a0a66ad60fba52bf', 2, 'A', now()) 
;
		*/