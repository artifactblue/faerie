var pool = require('../dbConnectionPool.js')

function RssView() {}

RssView.prototype.read = function(id) {
    return pool.query('SELECT * FROM rssView WHERE id = $1', [id])
}

RssView.prototype.create = function(entity) {

}

RssView.prototype.update = function(entity) {

}

exports = module.exports = new RssView()
