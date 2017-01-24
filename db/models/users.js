var pool = require('../dbConnectionPool.js');

function Users() {}

Users.prototype.read = function(id) {
    return pool.query('SELECT * FROM users WHERE id = $1', [id]);
};

Users.prototype.readByUserKey = function(userKey) {
	return pool.query('SELECT * FROM users WHERE userKey = $1', [userKey]);
}

Users.prototype.create = function(entity) {
	return pool.query('INSERT INTO users (DisplayName, UserKey, CreateTimestamp) VALUES ($1, $2, now()) ' + 
		'ON CONFLICT (UserKey) DO UPDATE SET CreateTimestamp = now() WHERE UserKey = $3', 
		[entity.displayName, entity.userKey, entity.userKey]);
}

Users.prototype.update = function(entity) {
	
}

exports = module.exports = new Users();