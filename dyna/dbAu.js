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
};

module.exports.dbAu = function () {
	return dbAu;
};
