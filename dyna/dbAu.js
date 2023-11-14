const axios = require('axios');

let dbAu = {
	get: async function () {
		const response = await axios('https://hsfarmbot-40ef.restdb.io/rest/auction', {
			method: 'GET',
			headers: {
				'cache-control': 'no-cache',
				'x-apikey': process.env.DBK,
			},
		}).then((x) => x.data);
		return response;
	},
	post: async function (username, userDb) {
		await axios('https://hsfarmbot-40ef.restdb.io/rest/auction', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'cache-control': 'no-cache',
				'x-apikey': process.env.DBK,
			},
			data: userDb,
		});
	},
	put: async function (username, userDb) {
		await axios(`https://hsfarmbot-40ef.restdb.io/rest/auction/${username}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'cache-control': 'no-cache',
				'x-apikey': process.env.DBK,
			},
			data: userDb,
		});
	},
};

module.exports.dbAu = function () {
	return dbAu;
};
