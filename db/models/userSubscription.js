var pool = require('../dbConnectionPool.js');

function UserSubscription() {}

UserSubscription.prototype.readByUserId = function(id) {
    return pool.query('SELECT * FROM userSubscription WHERE userId = $1', [id]);
};

UserSubscription.prototype.create = function(entity) {

}

UserSubscription.prototype.update = function(entity) {
	
}

exports = module.exports = new UserSubscription();