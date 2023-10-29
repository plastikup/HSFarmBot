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
		return require('./commands/help.js').cm_help();
	},
	view: async (word, userDb) => {
		return await require('./commands/view.js').cm_view(word, userDb);
	},
};
const generateFarmImg = require('./script/generateFarmImg.js');

/* --- CONSTANTS --- */

const cts = require('./constants.js').cts();
const VALID_HEAD_COMMAND_REGEXP = cts.VALID_HEAD_COMMAND_REGEXP;
const cropTypes = cts.cropTypes;
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
			let farm = userDb.farm;
			let spot = sentence[3] - 1;
			let seed = sentence[1].substring(0, sentence[1].search(/(seeds?|)$/i));
			if (cropTypes._seed_types_regexp.test(seed) && userDb.seedsInventory[seed + 'Seeds'] > 0 && spot >= 0 && spot < 9) {
				if (Math.floor(farm[spot].growthLevel) == 0 || Math.floor(farm[spot].growthLevel) == -1) {
					farm[spot].growthLevel = 1;
					farm[spot].plantedAt = Date.now();
					farm[spot].seedType = seed;
					farm[spot].secret = false;
					farm[spot].lastWater = Date.now();

					userDb.seedsInventory[seed + 'Seeds']--;

					answer = `Planted one cute **${seed.toLowerCase()} seed** to spot ${spot + 1}. Here's how your farm looks like now:\n\n${await generateFarmImg.generateFarmImg(userDb)}\n\nRemember to frequently water your farm (**every 8 hours**)!`;
				} else {
					answer = `It looks like you have **already something planted there**.\n\n${await generateFarmImg.generateFarmImg(userDb)}`;
				}
			} else if (!cropTypes._seed_types_regexp.test(seed)) {
				answer = `Unknown type of seed.`;
			} else if (spot >= 0 && spot < 9) {
				answer = `**You do not own any ${seed} seeds**. Reply with \`@FarmBot shop\` to buy some!`;
			} else {
				answer = `Invalid spot ID. **Top left starts at 1** and goes from left to right **until 9**.`;
			}
			break;
		case 'water':
			let nextWaterTS = userDb.lastWater + 28800000;
			if (Date.now() > nextWaterTS || devforced) {
				let somethingToWater = false;
				for (let i = 0; i < userDb.farm.length; i++) {
					userDb.farm[i].lastWater = Date.now();
					const seedType = userDb.farm[i].seedType;
					if (seedType != null && userDb.farm[i].growthLevel != -1) {
						let increment = 3 / cropTypes[seedType].watersRequired;
						/*
						if (seedType == 'blueberry') increment = 0.375; // 8 waters
						else if (seedType == 'pinkTulip') increment = 0.3; // 10 waters
						else if (seedType == 'strawberry') increment = 0.6; // 5 waters
						else if (seedType == 'sunflower') increment = 0.25; // 12 waters
						else if (seedType == 'wheat') increment = 0.6; // 5 waters
						*/
						userDb.farm[i].growthLevel += increment;
						/*
						if (userDb.farm[i].fertilizerCount > 0) {
							userDb.farm[i].growthLevel = userDb.farm[i].growthLevel + increment;
							userDb.farm[i].fertilizerCount = userDb.farm[i].fertilizerCount - 1;
						}
						*/
						somethingToWater = true;
					}
				}

				if (!somethingToWater) {
					answer = `No crops to water!\n\n${await generateFarmImg.generateFarmImg(userDb)}`;
				} else {
					userDb.lastWater = Date.now();
					answer = `@${userDb.username}, you have watered your thirsty plants!\n\n${await generateFarmImg.generateFarmImg(userDb)}\n\nMake sure to water them again **in 8 hours!**`;
				}
			} else {
				if (nextWaterTS - Date.now() < 60000) {
					answer = `Your plants are not thirsty. Try again in **${Math.floor((nextWaterTS - Date.now()) / 1000)} seconds**!`;
				} else {
					answer = `Your plants are not thirsty. Try again in **${Math.floor((nextWaterTS - Date.now()) / (1000 * 60 * 60))} hour(s) and ${Math.floor((nextWaterTS - Date.now()) / (1000 * 60)) % 60} minute(s)**!`;
				}
			}
			break;
		case 'harvest':
			if ((sentence[2] < 1 || sentence[2] > 9) && typeof sentence[2] == typeof 9) {
				answer = `Invalid spot ID. **Top left starts at 1** and goes from left to right **until 9**.`;
			} else if (userDb.farm[sentence[2] - 1].seedType == null) {
				answer = `There is **no crop at spot ${sentence[2]}**!\n\n${await generateFarmImg.generateFarmImg(userDb)}`;
			} else if (userDb.farm[sentence[2] - 1].growthLevel == -1) {
				answer = `Your crop at spot ${sentence[2]} is **dead**.\n\n${await generateFarmImg.generateFarmImg(userDb)}\n\nRemember to **water your farm** frequently.`;
			} else if (Math.floor(userDb.farm[sentence[2] - 1].growthLevel) < 4) {
				answer = `Your crop at spot ${sentence[2]} is **not ready to be harvested yet**!\n\n${await generateFarmImg.generateFarmImg(userDb)}`;
			} else {
				const targetCrop = userDb.farm[sentence[2] - 1].seedType;

				userDb.farm[sentence[2] - 1] = JSON.parse(newUser.newFarmDefault);
				userDb.cropsInventory[targetCrop + 'Crops']++;
				userDb.coins += cropTypes[targetCrop].earnings;

				answer = `Harvested a gorgeous **${targetCrop}** from spot ${sentence[2]} - you won **${cropTypes[targetCrop].earnings} coins**!\n\n${await generateFarmImg.generateFarmImg(userDb)}`;
			}
			break;
		case 'daily':
			let lastDaily = userDb.lastDaily;
			if (Date.now() > lastDaily + 82800000 || devforced) {
				const randomGrant = Math.round(Math.random() * 100 + 50);
				userDb.lastDaily = Date.now();
				userDb.coins += randomGrant;

				answer = `Granted... &#x1f3b2; &#x1f3b2; **${randomGrant} coins** to your account! Come back in **23 hours** to request another \`@FarmBot daily\`!`;
			} else {
				if (lastDaily + 82800000 - Date.now() < 60000) {
					answer = `You have recently requested a **daily**. Try again in **${Math.floor((lastDaily + 82800000 - Date.now()) / 1000)} seconds**!`;
				} else {
					answer = `You have recently requested a **daily**. Try again in **${Math.floor((lastDaily + 82800000 - Date.now()) / (1000 * 60 * 60))} hours and ${Math.floor((lastDaily + 82800000 - Date.now()) / (1000 * 60)) % 60} minutes**!`;
				}
			}
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

const HELP_POST_CONTENT = `Hey, I’m FarmBot, the cutest bot ever! Here are the following commands I can do. Type \`@FarmBot\` before any of these to get my attention! Words in brackets mean that they need to be changed based on what you want to put there.\r\n[quote=General]\r\n\`@FarmBot help\` — brings up introduction and list of commands\r\n\`@FarmBot begin\` — registers you as a farmer with an account linked to your forum username. **this step is required to start playing the farming game**!\r\n[/quote]\r\n[quote="Farming"]\r\n\`@FarmBot view farm\` — shows your farm\r\n\`@FarmBot view inventory\` — check items\r\n\`@FarmBot plant [item] spot [number]\` — plant seeds at select location\r\n\`@FarmBot water\` — water your crops (every 8 hours)\r\n\`@FarmBot harvest spot [number]\` — harvests crop at select location\r\n\`@FarmBot fertilize spot [number] with [item]\` — fertilizes desired crop\r\n[/quote]\r\n[details=some other stuff coming soon ;)]\r\n[quote="Gardening"]\r\n*coming soon!*\r\n[/quote]\r\n[quote="Gifting"]\r\n*coming soon!*\r\n[/quote]\r\n[quote="Moosefarms Shop"]\r\n*coming soon!*\r\n[/quote]\r\n[quote="Market"]\r\n*coming soon!*\r\n[/quote]\r\n---\r\n[/details]\r\nHave a bug report? Tag @/Tri-Angle! Have a concern or suggestion regarding the game itself? Tag @/StarlightStudios!\r\n\r\nHave fun, and don’t forget to water your crops!`;

const NEW_USER_JSON = {
	farm: [
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
		{
			fertilizerCount: 0,
			growthLevel: 0,
			lastWater: 0,
			plantedAt: null,
			secret: false,
			seedType: null,
		},
	],
	lastWater: 0,
	coins: 0,
	lastDaily: 0,
	seedsInventory: {
		blueberrySeeds: 0,
		pinkTulipSeeds: 0,
		strawberrySeeds: 0,
		sunflowerSeeds: 0,
		wheatSeeds: 5,
	},
	cropsInventory: {
		blueberryCrops: 0,
		pinkTulipCrops: 0,
		strawberryCrops: 0,
		sunflowerCrops: 0,
		wheatCrops: 0,
	},
	username: 'ZZZ-DU',
};

const newUser = {
	newFarmDefault: `{"growthLevel":0,"plantedAt":null,"seedType":null,"secret":false,"lastWater":0,"fertilizerCount":0}`,
	/* used in previous version, now unused.
	newSeedsInventoryDefault: `{
		"wheatSeeds": 5,
		"strawberrySeeds": 0,
		"blueberrySeeds": 0,
		"pinkTulipSeeds": 0,
		"sunflowerSeeds": 0
	}`,
	newCropsInventoryDefault: `{
		"wheatCrops": 0,
		"strawberryCrops": 0,
		"blueberryCrops": 0,
		"pinkTulipCrops": 0,
		"sunflowerCrops": 0
	}`,
	newSpecialItemsDefault: `{
		"fertilizers": 2
	}`,*/
};
