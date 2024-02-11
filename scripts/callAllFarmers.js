module.exports = async (db) => {
	const allFarmersRaw = db
		.map((user) => user.username)
		.filter((username) => !/(ZZZ-DU|TriAngleHSFBTester)/.test(username))
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((username) => '@' + username);

	const allFarmers = JSON.stringify(allFarmersRaw)
		.replace(/["[\]]/g, '')
		.replace(/,/g, ' ');

	return allFarmers;
};
