'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const DEV = /^localhost:\d+$/.test(process.env.DETA_SPACE_APP_HOSTNAME);
require('dotenv').config({ override: DEV });

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(PORT, () => {
	console.log(`Example app listening at http://localhost:${PORT}`);
});

app.use(bodyParser.json());

app.post('/wh', async (req, res) => {
	console.log('received wh');
	await main(req.body);
	res.status(200).send('OK');
});

app.post('/daily', (req, res) => {
	res.status(200).send('OK');
	console.log('received wh (daily)');
	createForumPost(`# DAILY FEATURED GARDEN\n(in dev [this is mostly a test])`, 99999);
});

/* --- MODULES --- */
const cml = {
	help: () => {
		return require('./commands/help.js').cm();
	},
	view: async (word, userDb) => {
		return await require('./commands/view.js').cm(word, userDb);
	},
	plant: async (sentence, userDb) => {
		return await require('./commands/plant.js').cm(sentence, userDb);
	},
	water: async (userDb, devforced) => {
		return await require('./commands/water.js').cm(userDb, devforced);
	},
	harvest: async (sentence, userDb) => {
		return await require('./commands/harvest.js').cm(sentence, userDb);
	},
	daily: async (userDb, devforced) => {
		return await require('./commands/daily.js').cm(userDb, devforced);
	}
};
const generateFarmImg = require('./script/generateFarmImg.js');

/* --- CONSTANTS --- */

const cts = require('./constants.js').cts();
const VALID_HEAD_COMMAND_REGEXP = cts.VALID_HEAD_COMMAND_REGEXP;
const cropTypes = cts.cropTypes;
const NEW_USER_JSON = cts.NEW_USER_JSON;
const newFarmDefault = cts.newFarmDefault;
let devforced = false;

/* --- START OF WH --- */

async function main(req) {
	let username = req.post.username;
	const cooked = req.post.cooked;
	const post_number = req.post.post_number;

	// exit if is self
	if (username == 'FarmBot') return undefined;

	// exit if not talking to fb
	if (!cooked.match('<a class="mention" href="/u/farmbot">@FarmBot</a>')) return undefined;

	// recreate post content (raw)
	let raw = cooked.substring(3, cooked.length - 4);
	raw = raw.replace(/<a class="mention" href="\/u\/farmbot">@FarmBot<\/a> ?/gm, '@FarmBot ');

	// commandList + check if invalidCommand (save on monthly api calls)
	let invalidCommand = null;
	let authenticate = false;
	let commandList = raw
		.trim()
		.split('\n')
		.filter((i) => i);
	for (let i = 0; i < commandList.length; i++) {
		commandList[i] = commandList[i]
			.replace(/@FarmBot ?/, '')
			.split(' ')
			.filter((i) => i);
		if (commandList[i][0] == 'begin') authenticate = true;
		else if (!commandList[i][0].match(VALID_HEAD_COMMAND_REGEXP)) invalidCommand = commandList[i][0];
	}
	if (invalidCommand != null) {
		await createForumPost(`Unknown command \`${invalidCommand}\`.`, post_number);
		return undefined;
	}

	// devforced (only applies to water & daily)
	if (commandList[0][commandList[0].length - 1].toLowerCase() == 'devforced') {
		if (!username.match(/^(Tri-Angle|StarlightStudios)$/)) return undefined;
		devforced = true;
	} else devforced = false;

	// [mod only] takeover
	if (commandList[0][0].toLowerCase() == 'takeover') {
		if (!username.match(/^(Tri-Angle|StarlightStudios)$/)) return undefined;
		username = commandList[0][1];
		commandList[0].splice(0, 1);
		commandList[0].splice(0, 1);
	}

	// check if authenticated
	let db = await dbFus.get();
	let userDb = searchForAccount(username, db);
	if (authenticate) {
		if (userDb == null) {
			dbFus.post(username);
			await createForumPost(`You have a farming account now! You can enter \`@FarmBot help\` for a list of command. Happy forum gaming, and thanks for joining!`, post_number);
		} else {
			await createForumPost(`You already have an account. You can start playing now! Enter \`@FarmBot help\` for a list of command to get started.`, post_number);
		}
		return undefined;
	} else if (userDb == null) {
		await createForumPost(`You are unauthenticated. Get your journey started with \`@FarmBot begin\`!`, post_number);
		return undefined;
	}

	// kill dead crops
	userDb = killDeadCrops(userDb);

	// mod or player?
	if (commandList[0][0].toLowerCase() != '::mod') {
		// interpret commands
		let arrayedAnswers = [];
		for (let i = 0; i < commandList.length; i++) {
			const sentence = commandList[i];
			[arrayedAnswers[i], userDb] = await interpretCommand(sentence, userDb);
		}

		// reply user
		let textualAnswer = arrayedAnswers.join('\n___\n');
		await createForumPost(textualAnswer, post_number);

		// update database
		dbFus.put(userDb._id, userDb);

		// end
		console.log('--- end ---');
	} else {
		if (!username.match(/^(Tri-Angle|StarlightStudios)$/)) return undefined;
		const sentence = commandList[0];
		let answer = null;
		let tgUserDb = null;
		switch (sentence[1]) {
			case 'grant_s':
				tgUserDb = searchForAccount(sentence[2], db);
				if (tgUserDb == null) {
					answer = `Unauthenticated user @${sentence[2]}.`;
				} else {
					for (let i = 3; i < sentence.length; i++) {
						const types = ['blueberrySeeds', 'pinkTulipSeeds', 'strawberrySeeds', 'sunflowerSeeds', 'wheatSeeds'];
						tgUserDb.seedsInventory[types[i - 3]] += Math.round(sentence[i]);
					}
					dbFus.put(tgUserDb._id, tgUserDb);
					answer = `Granted specified seeds to @${sentence[2]}.`;
				}
				break;
			case 'grant_c':
				tgUserDb = searchForAccount(sentence[2], db);
				if (tgUserDb == null) {
					answer = `Unauthenticated user @${sentence[2]}.`;
				} else {
					for (let i = 3; i < sentence.length; i++) {
						const types = ['blueberryCrops', 'pinkTulipCrops', 'strawberryCrops', 'sunflowerCrops', 'wheatCrops'];
						tgUserDb.cropsInventory[types[i - 3]] += Math.round(sentence[i]);
					}
					dbFus.put(tgUserDb._id, tgUserDb);
					answer = `Granted specified crops to @${sentence[2]}.`;
				}
				break;

			default:
				answer = `Unrecognized mod command \`${sentence[1]}\`.`;
				break;
		}
		await createForumPost('[MOD ACTION] ' + answer, post_number);
		console.log('--- MOD END ---');
	}
}

function killDeadCrops(userDb) {
	for (let i = 0; i < 9; i++) {
		if (userDb.farm[i].seedType != null && Date.now() > userDb.farm[i].lastWater + 216000000) {
			userDb.farm[i].growthLevel = -1;
		}
	}
	return userDb;
}

function searchForAccount(username, db) {
	for (let i = 0; i < db.length; i++) {
		if (db[i].username == username) return db[i];
	}
	return null;
}

async function interpretCommand(sentence, userDb) {
	let answer = null;
	switch (sentence[0].toLowerCase()) {
		case 'help':
			answer = cml.help();
			break;
		case 'view':
			answer = await cml.view(sentence[1].toLowerCase(), userDb);
			break;
		case 'plant':
			[answer, userDb] = await cml.plant(sentence, userDb);
			break;
		case 'water':
			[answer, userDb] = await cml.water(userDb, devforced);
			break;
		case 'harvest':
			[answer, userDb] = await cml.harvest(sentence, userDb);
			break;
		case 'daily':
			[answer, userDb] = await cml.daily(userDb, devforced);
			break;
		case 'shop':
			break;

		default:
			answer = `Unrecognized command \`${sentence[0]}\`.`;
			break;
	}
	return [answer, userDb];
}

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
	put: async function (usernameId, userDb) {
		await axios(`https://hsfarmbot-40ef.restdb.io/rest/v-v1/${usernameId}`, {
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

async function createForumPost(raw = 'default text', post_number) {
	await axios(`https://forum.gethopscotch.com/posts.json`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Api-Username': 'FarmBot',
			'Api-Key': process.env.FBK,
		},
		data: {
			raw: `<!--${Date.now()}-->\n${raw}`,
			topic_id: '66178',
			reply_to_post_number: post_number,
		},
		redirect: 'follow',
	})
		.then((response) => response.data)
		.then((result) => console.log(result))
		.catch((error) => console.log('error', error));
}
