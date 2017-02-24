var pool = require('../dbConnectionPool.js')

function Category() {}

Category.prototype.all = function() {
	return pool.query('SELECT count(1) AS total FROM category WHERE status = true')
}

Category.prototype.read = function(id) {
    return pool.query('SELECT * FROM category WHERE id = $1 AND status = true', [id])
}

Category.prototype.readAll = function(limit = 3, offset = 0) {
    return pool.query('SELECT * FROM category WHERE status = true ORDER BY id LIMIT ' + limit + ' OFFSET ' + offset)
}

Category.prototype.create = function(entity) {
	return pool.query('INSERT INTO category (Name, Thumbnail, CreateTimestamp) '
		+ ' VALUES ($1, $2, now())', 
		[entity.name, entity.thumbnail]);
}

Category.prototype.update = function(entity) {

}

exports = module.exports = new Category()
