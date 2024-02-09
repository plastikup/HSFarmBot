const cml = {
	help: () => {
		return require('../commands/help.js').cm();
	},
	view: async (word, userDb) => {
		return await require('../commands/view.js').cm(word, userDb);
	},
	plant: async (sentence, userDb) => {
		return await require('../commands/plant.js').cm(sentence, userDb);
	},
	water: async (userDb, devforced) => {
		return await require('../commands/water.js').cm(userDb, devforced);
	},
	harvest: async (sentence, userDb) => {
		return await require('../commands/harvest.js').cm(sentence, userDb);
	},
	daily: async (userDb, devforced) => {
		return await require('../commands/daily.js').cm(userDb, devforced);
	},
	buy: async (sentence, userDb) => {
		return await require('../commands/buy.js').cm(sentence, userDb);
	},
	sell: async (sentence, userDb) => {
		return await require('../commands/sell.js').cm(sentence, userDb);
	},
	auction: async (sentence, userDb, devforced) => {
		return await require('../commands/auction.js').cm(sentence, userDb, devforced);
	},
	garden: async (sentence, userDb) => {
		return await require('../commands/garden.js')(sentence, userDb);
	},
};

module.exports = async (commandList, userDb, devforced = false) => {
	// interpret commands
	let arrayedAnswers = [];
	for (let i = 0; i < commandList.length; i++) {
		const sentence = commandList[i];
		arrayedAnswers[i] = await interpret(sentence);
	}

	async function interpret(sentence) {
		let answer = null;
		switch (sentence[0].toLowerCase()) {
			case 'help':
				answer = cml.help();
				break;
			case 'view':
				answer = await cml.view(sentence, userDb);
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
			case 'buy':
				[answer, userDb] = await cml.buy(sentence, userDb);
				break;
			case 'sell':
				[answer, userDb] = await cml.sell(sentence, userDb);
				break;
			case 'bid':
				[answer, userDb] = await cml.auction(sentence, userDb, devforced);
				break;
			/*
			case 'garden':
				[answer, userDb] = await cml.garden(sentence, userDb);
				break;
			*/

			default:
				answer = `Unrecognized command \`${sentence[0]}\`.`;
				break;
		}
		return answer;
	}

	return [arrayedAnswers.join('\n___\n'), userDb];
};
