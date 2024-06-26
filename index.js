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
		if (process.env.NODE_ENV === 'development') {
			throw error;
		} else {
			await require('./dyna/newForumPost')(`An error has occurred: \`${error}\`.`, null, req.body.post.topic_id);
		}
	}
	res.status(200).send('OK');
});
app.post('/__space/v0/actions', async (req, res) => {
	const event = req.body.event;

	if (event.id === 'dailyGarden') {
		console.log('[TRI-ANGLE][DEBUG] DAILYGARDEN DETA CRON JOB EVENT HAS BEEN TRIGGERED');

		const db = await require('./dyna/dbFus.js').get();
		const filteredDb = db.filter((user) => user.garden?.length > 0 && user.dbVersion === require('./constants.js').botVersion && require('./commands/level.js').calcUserLevel(user.experiences) >= 3);

		const randomlyFeaturedUser = filteredDb[Math.floor(Math.random() * filteredDb.length)];

		await require('./dyna/newForumPost')(`# Featured Garden of the Day\n\n@/${randomlyFeaturedUser.username}'s garden:\n\n${await require('./scripts/generateFarmImg.js').generateFarmImg(randomlyFeaturedUser, true)}\n\n@TheFarmers`, 99999, 66773);
	}

	res.sendStatus(200);
});

let devforced = false;

/* --- START OF WH --- */

async function main(req) {
	/* modules declarations */
	const dbFus = await require('./dyna/dbFus.js');
	const newForumPost = await require('./dyna/newForumPost');

	const cts = require('./constants.js');
	const VALID_HEAD_COMMAND_REGEXP = cts.VALID_HEAD_COMMAND_REGEXP;

	/* script start */
	let username = req.post.username;
	const cooked = req.post.cooked;
	const post_number = req.post.post_number;
	const topic_id = req.post.topic_id;

	// exit if is self
	if (username == 'FarmBot') return;
	// exit if not talking to fb
	if (!cooked.match(/<a class="mention" href="\/u\/farmbot">@FarmBot<\/a>/i)) return;
	// exit if edit window longer than 20 seconds
	if (Date.now() - Date.parse(req.post.created_at) > 20000 && process.env.NODE_ENV !== 'AAAdevelopment') return;
	// * reject post if command is nested into two or more quotes (BETA)
	if (cooked.match(/(<aside[^>\n]*>(.|\n)*){2,}<a class="mention" href="\/u\/farmbot">@FarmBot<\/a>((.|\n)*<\/aside>){2}/i)) return;

	// recreate post content (raw)
	let raw = cooked.replace(/(<\/?p>|<(\/ ?)?br>)/gm, '').replace(/<a class="mention" href="\/u\/farmbot">@FarmBot<\/a> ?/gim, '@FarmBot ');

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
		return;
	}

	// avoid spam
	if (commandList.length > 5) {
		await newForumPost(`I don't accept to execute more than 5 commands at once. #minimumwage /j`, post_number, topic_id);
		return;
	}

	// devforced (only applies to water & daily)
	if (commandList[0][commandList[0].length - 1].toLowerCase() == 'devforced') {
		if (!username.match(/^(Tri-Angle|StarlightStudios)$/)) return;
		devforced = true;
	} else devforced = false;

	// [mod only] takeover
	if (commandList[0][0].toLowerCase() == 'takeover') {
		if (!username.match(/^(Tri-Angle|StarlightStudios)$/)) return;
		username = commandList[0][1];
		commandList[0].splice(0, 1);
		commandList[0].splice(0, 1);
	}

	// check if authenticated
	let db = await dbFus.get();
	let userDb = await require('./scripts/searchForAccount')(username, db);

	if (authenticate) {
		if (userDb == null) {
			dbFus.post(username);
			await newForumPost(`You have a farming account now! You can enter \`@FarmBot help\` for a list of command. Happy forum gaming, and thanks for joining!\n\n*psst*, did you know you have 5 free wheat seeds? Go plant your first crop now! :))`, post_number, topic_id);
		} else {
			await newForumPost(`You already have an account. You can start playing now! Enter \`@FarmBot help\` for a list of command to get started.`, post_number, topic_id);
		}
		return;
	} else if (userDb == null) {
		await newForumPost(`You are unauthenticated. Get your journey started with \`@FarmBot begin\`!`, post_number, topic_id);
		return;
	}

	// update db if applies
	if (userDb.dbVersion !== cts.botVersion) userDb = await require('./scripts/databaseVersionPatch.js')(userDb);

	// kill dead crops
	userDb = await require('./scripts/killDeadCrops')(userDb);

	// mod or player?
	if (commandList[0][0].toLowerCase() != '::mod' && commandList[0][0].toLowerCase() != '::beta') {
		// get original level of the farmer
		const originalLevel = await require('./commands/level.js').calcUserLevel(+userDb.experiences);

		// exe
		let answer = '';
		[answer, userDb] = await require('./scripts/interpretCommand.js')(commandList, userDb, db, devforced);
		userDb.experiences = Math.min(userDb.experiences, 1935); // cap to level 10

		// get new level of the farmer
		const newLevel = await require('./commands/level.js').calcUserLevel(+userDb.experiences);
		// if new level is higher than old level, add congrats message and grant stuff
		if (originalLevel < newLevel) {
			[answer, userDb] = await require('./scripts/levelRewards.js')(answer, userDb, newLevel);
		}

		// update database
		dbFus.put(userDb._id, userDb);

		// post message
		if (answer.length <= 21000) await newForumPost(answer, post_number, topic_id);
		else await newForumPost(`You made me reach the forum character limit, smh!\n<small>usually means your commands have made it through`, post_number, topic_id);
	} else if (commandList[0][0].toLowerCase() == '::mod') {
		if (!req.post.username.match(/^(Tri-Angle|StarlightStudios)$/)) return;
		await newForumPost('[MOD ACTION] ' + (await require('./scripts/interpretModCommand.js')(commandList[0], userDb, db, cooked)), post_number + commandList[0][1] == 'start_auction' * 99999, topic_id);
	} else {
		if (!req.post.username.match(/^(Tri-Angle|StarlightStudios|TriAngleHSFBTester)$/)) return;
		let answer = '';
		[answer, userDb] = await require('./scripts/interpretBetaCommand.js')(commandList, userDb, db, devforced);

		// update database
		dbFus.put(userDb._id, userDb);

		// post message
		if (answer.length <= 21000) await newForumPost(answer, post_number, topic_id);
		else await newForumPost(`You made me reach the forum character limit, smh!\n<small>usually means your commands have made it through`, post_number, topic_id);
	}
}
