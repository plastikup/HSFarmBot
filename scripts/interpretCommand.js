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
};

let cm = async (sentence, userDb, devforced) => {
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
			answer = 'Shop in progress.';
			break;

		default:
			answer = `Unrecognized command \`${sentence[0]}\`.`;
			break;
	}
	return [answer, userDb];
};

module.exports.cm = async function (sentence, userDb, devforced) {
	return await cm(sentence, userDb, devforced);
};
