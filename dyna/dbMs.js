const axios = require('axios');

let dbMs = {
	get: async function () {
		const response = await axios('https://hsfarmbot-40ef.restdb.io/rest/moosefarms', {
			method: 'GET',
			headers: {
				'cache-control': 'no-cache',
				'x-apikey': process.env.DBK,
			},
		}).then((x) => x.data);
		return response;
	},
};

module.exports.dbMs = function () {
	return dbMs;
};
