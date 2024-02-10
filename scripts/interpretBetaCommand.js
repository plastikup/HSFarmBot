/* eslint-disable no-unused-vars */
const generateFarmImg = require('../scripts/generateFarmImg.js');
const cml = {
	level: (userDb) => {
		return require('../commands/level.js').cm(userDb);
	},
	garden: async (sentence, userDb) => {
		return await require('../commands/garden.js')(sentence, userDb);
	},
};

module.exports = async (commandList, userDb, devforced = false) => {
	// interpret commands
	let arrayedAnswers = [];
	for (let i = 0; i < commandList.length; i++) {
		const sentence = commandList[i].slice(1);
		arrayedAnswers[i] = await interpret(sentence);
	}

	async function interpret(sentence) {
		let answer = null;
		// eslint-disable-next-line no-constant-condition
		if (false) {
			return 'Currently no `::beta` command to test.';
		} else {
			switch (sentence[0].toLowerCase()) {
				case 'view_garden':
					answer = `@/${userDb.username}'s **garden**.\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`;
					break;
				case 'garden':
					[answer, userDb] = await cml.garden(sentence, userDb);
					break;
				default:
					answer = `Unrecognized beta **sub**command \`${sentence[0]}\`.`;
					break;
			}
			return answer;
		}
	}

	return [arrayedAnswers.join('\n___\n'), userDb];
};
