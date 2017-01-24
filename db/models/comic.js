var pool = require('../dbConnectionPool.js');

function Comic() {}

Comic.prototype.read = function(id) {
    return pool.query('SELECT * FROM comic WHERE id = $1', [id]);
};

Comic.prototype.readAll = function(limit = 1) {
	return pool.query('SELECT * FROM comic LIMIT ' + limit);
}

Comic.prototype.create = function(entity) {

}

Comic.prototype.update = function(entity) {
	
}

exports = module.exports = new Comic();