var pool = require('../dbConnectionPool.js')


function Rss() {}

Rss.prototype.read = function(id) {
    return pool.query('SELECT * FROM rss WHERE id = $1', [id])
}

Rss.prototype.readAll = function(limit = 3, offset = 0) {
    return pool.query('SELECT * FROM rss ORDER BY id LIMIT ' + limit + ' OFFSET ' + offset)
}

Rss.prototype.readByCategoryId = function(categoryId, limit = 3, offset = 0) {
	return pool.query('SELECT * FROM rss WHERE categoryId = $1 ORDER BY id LIMIT ' + limit + ' OFFSET ' + offset, [categoryId]);
}

Rss.prototype.create = function(entity) {

}

Rss.prototype.update = function(entity) {

}

exports = module.exports = new Rss()
