const axios = require('axios');

let dbFus = {
	get: async function () {
		const response = await axios('https://hsfarmbot-40ef.restdb.io/rest/v-v1', {
			method: 'GET',
			headers: {
				'cache-control': 'no-cache',
				'x-apikey': process.env.DBK,
			},
		}).then((x) => x.data);
		return response;
	},
	post: async function (username) {
		let thisUserJson = { ...NEW_USER_JSON };
		thisUserJson.username = username;
		thisUserJson = thisUserJson;

		await axios('https://hsfarmbot-40ef.restdb.io/rest/v-v1', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'cache-control': 'no-cache',
				'x-apikey': process.env.DBK,
			},
			data: thisUserJson,
		});
	},
	put: async function (username, userDb) {
		await axios(`https://hsfarmbot-40ef.restdb.io/rest/v-v1/${username}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'cache-control': 'no-cache',
				'x-apikey': process.env.DBK,
			},
			data: userDb,
		});
	},
};

module.exports.dbFus = function () {
	return dbFus;
};
