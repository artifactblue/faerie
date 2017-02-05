var pool = require('../dbConnectionPool.js')

function Users() {}

Users.prototype.read = function(id) {
    return pool.query('SELECT * FROM users WHERE id = $1', [id])
}

Users.prototype.create = function(entity) {
	return pool.query('INSERT INTO users (DisplayName, id, CreateTimestamp) '
		+ ' SELECT $1, $2, now() WHERE NOT EXISTS '
		+ ' (SELECT 1 FROM users WHERE id = $3 AND displayname = $4)', 
		[entity.displayName, entity.id, entity.id, entity.displayName])
}

Users.prototype.update = function(entity) {
	
}

exports = module.exports = new Users()
