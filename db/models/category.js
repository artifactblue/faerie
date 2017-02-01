var pool = require('../dbConnectionPool.js');

function Category() {}

Category.prototype.read = function(id) {
    return pool.query('SELECT * FROM category WHERE id = $1', [id]);
};

Category.prototype.readAll = function(limit = 3) {
       return pool.query('SELECT * FROM category LIMIT ' + limit);
}

Category.prototype.create = function(entity) {

}

Category.prototype.update = function(entity) {

}

exports = module.exports = new Category();