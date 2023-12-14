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
	try {
		await main(req.body);
	} catch (error) {
		await newForumPost(`An error has occured: \`${error}\`.`, null, topic_id);
	}
	res.status(200).send('OK');
});
app.post('/daily', async (req, res) => {
	await newForumPost(`# DAILY FEATURED GARDEN\n(in dev [this is mostly a test])`, 99999, 66178);
	res.status(200).send('OK');
});

let devforced = false;

/* --- START OF WH --- */

async function main(req) {
	/* modules declarations */
	const dbFus = await require('./dyna/dbFus.js');
	const newForumPost = await require('./dyna/newForumPost');

	const cts = require('./constants.js');
	const VALID_HEAD_COMMAND_REGEXP = cts.VALID_HEAD_COMMAND_REGEXP;
	const NEW_USER_JSON = cts.NEW_USER_JSON;

	/* script start */
	let username = req.post.username;
	const cooked = req.post.cooked;
	const post_number = req.post.post_number;
	const topic_id = req.post.topic_id;

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
	for (let i = commandList.length - 1; i >= 0; i--) {
		if (commandList[i].toLowerCase().includes('@farmbot')) {
			commandList[i] = commandList[i]
				.replace(/@FarmBot ?/, '')
				.split(' ')
				.filter((i) => i);
			if (commandList[i][0] == 'begin') authenticate = true;
			else if (!commandList[i][0].match(VALID_HEAD_COMMAND_REGEXP)) invalidCommand = commandList[i][0];
		} else {
			commandList.splice(i, 1);
		}
	}
	if (invalidCommand != null) {
		await newForumPost(`Unknown command \`${invalidCommand}\`.`, post_number, topic_id);
		return undefined;
	}

	// avoid spam
	if (commandList.length > 5) {
		await newForumPost(`I don't accept to execute more than 5 commands at once. #minimumwage /j`, post_number, topic_id);
		return;
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
			await newForumPost(`You have a farming account now! You can enter \`@FarmBot help\` for a list of command. Happy forum gaming, and thanks for joining!`, post_number, topic_id);
		} else {
			await newForumPost(`You already have an account. You can start playing now! Enter \`@FarmBot help\` for a list of command to get started.`, post_number, topic_id);
		}
		return undefined;
	} else if (userDb == null) {
		await newForumPost(`You are unauthenticated. Get your journey started with \`@FarmBot begin\`!`, post_number, topic_id);
		return undefined;
	}

	// kill dead crops
	userDb = await require('./scripts/killDeadCrops').killDeadCrops(userDb);

	// mod or player?
	if (commandList[0][0].toLowerCase() != '::mod') {
		let answer = '';
		[answer, userDb] = await require('./scripts/interpretCommand.js').cm(commandList, userDb, devforced);

		// update database
		dbFus.put(userDb._id, userDb);

		// post message
		if (answer.length <= 21000) await newForumPost(answer, post_number, topic_id);
		else await newForumPost(`You made me reach the forum character limit, smh!\n<small>usually means your commands have made it through`, post_number, topic_id);
	} else {
		if (!username.match(/^(Tri-Angle|StarlightStudios)$/)) return undefined;
		await newForumPost('[MOD ACTION] ' + (await require('./scripts/interpretModCommand.js').cm(commandList[0], userDb, db)), post_number + commandList[0][1] == 'start_auction' * 9999, topic_id);
	}
}
