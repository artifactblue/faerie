var pool = require('../dbConnectionPool.js');

function ComicVols() {}

ComicVols.prototype.read = function(id) {
    return pool.query('SELECT * FROM comicVols WHERE id = $1', [id]);
};

ComicVols.prototype.create = function(entity) {

}

ComicVols.prototype.update = function(entity) {
	
}

exports = module.exports = new ComicVols();