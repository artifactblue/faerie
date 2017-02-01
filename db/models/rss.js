var pool = require('../dbConnectionPool.js');

function Rss() {}

Rss.prototype.read = function(id) {
    return pool.query('SELECT * FROM rss WHERE id = $1', [id]);
};

Rss.prototype.readAll = function(limit = 3) {
    return pool.query('SELECT * FROM rss LIMIT ' + limit);
}

Rss.prototype.create = function(entity) {

}

Rss.prototype.update = function(entity) {

}

exports = module.exports = new Rss();