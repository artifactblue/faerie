var pool = require('../dbConnectionPool.js');

function Users() {}

Users.prototype.read = function(id) {
    return pool.query('SELECT * FROM users WHERE id = $1', [id]);
};

Users.prototype.create = function(entity) {
	return pool.query('INSERT INTO users (DisplayName, id, CreateTimestamp) VALUES ($1, $2, now()) ' + 
		'ON CONFLICT (id) DO NOTHING', 
		[entity.displayName, entity.userKey]);
}

Users.prototype.update = function(entity) {
	
}

exports = module.exports = new Users();