var pool = require('../dbConnectionPool.js');

function Users() {}

Users.prototype.read = function(id) {
    return pool.query('SELECT * FROM users WHERE id = $1', [id]);
};

Users.prototype.create = function(entity) {

}

Users.prototype.update = function(entity) {
	
}

exports = module.exports = new Users();