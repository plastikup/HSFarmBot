'use strict';

const express = require('express');
const bodyParser = require('body-parser');
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
app.post('/post-action', async (req, res) => {
	console.log('received webhook');
	//try {
	await main(req.body);
	//} catch (error) {
	//	await newForumPost(`An error has occured: \`${error}\`.`, null);
	//}
	res.status(200).send('OK');
});
app.post('/daily', async (req, res) => {
	await newForumPost(`# DAILY FEATURED GARDEN\n(in dev [this is mostly a test])`, 99999);
	res.status(200).send('OK');
});

/* --- MODULES --- */

const dbFus = require('./dyna/dbFus.js').dbFus();

const newForumPost = (raw = 'default text', post_number) => require('./dyna/newForumPost').newForumPost(raw, post_number);

const cts = require('./constants.js').cts();
const VALID_HEAD_COMMAND_REGEXP = cts.VALID_HEAD_COMMAND_REGEXP;
const NEW_USER_JSON = cts.NEW_USER_JSON;

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
		await newForumPost(`Unknown command \`${invalidCommand}\`.`, post_number);
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
	let userDb = require('./scripts/searchForAccount').searchForAccount(username, db);
	if (authenticate) {
		if (userDb == null) {
			dbFus.post(username);
			await newForumPost(`You have a farming account now! You can enter \`@FarmBot help\` for a list of command. Happy forum gaming, and thanks for joining!`, post_number);
		} else {
			await newForumPost(`You already have an account. You can start playing now! Enter \`@FarmBot help\` for a list of command to get started.`, post_number);
		}
		return undefined;
	} else if (userDb == null) {
		await newForumPost(`You are unauthenticated. Get your journey started with \`@FarmBot begin\`!`, post_number);
		return undefined;
	}

	// kill dead crops
	userDb = await require('./scripts/killDeadCrops').killDeadCrops(userDb);

	// mod or player?
	if (commandList[0][0].toLowerCase() != '::mod') {
		let answer = '';
		[answer, userDb] = await require('./scripts/interpretCommand.js').cm(commandList, userDb, devforced);
		await newForumPost(answer, post_number);

		// update database
		dbFus.put(userDb._id, userDb);
	} else {
		if (!username.match(/^(Tri-Angle|StarlightStudios)$/)) return undefined;
		await newForumPost('[MOD ACTION] ' + (await require('./scripts/interpretModCommand.js').cm(commandList[0], userDb, db)), post_number);
	}
}
