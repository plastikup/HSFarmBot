let searchForAccount = (username, db) => {
	for (let i = 0; i < db.length; i++) {
		if (db[i].username == username) return db[i];
	}
	return null;
};

module.exports.searchForAccount = function (username, db) {
	return searchForAccount(username, db);
};
