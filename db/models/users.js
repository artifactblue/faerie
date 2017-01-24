var pool = require('../dbConnectionPool.js');

function Users() {}

Users.prototype.read = function(id) {
    return pool.query('SELECT * FROM users WHERE id = $1', [id]);
};

Users.prototype.readByUserKey = function(userKey) {
	return pool.query('SELECT * FROM users WHERE userKey = $1', [userKey]);
}

Users.prototype.create = function(entity) {
	return pool.query('REPLACE INTO users (DisplayName, UserKey, CreateTimestamp) VALUES ($1, $2, now())', 
		[entity.displayName, entity.userKey]);
}

Users.prototype.update = function(entity) {
	
}

exports = module.exports = new Users();