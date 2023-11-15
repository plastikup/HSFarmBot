const searchForAccount = (username, db) => require('./searchForAccount').searchForAccount(username, db);
const dbFus = require('../dyna/dbFus.js').dbFus();
const test = require('../constants.js').cts().test;

let cm = async (sentence, userDb, db) => {
	let tgUserDb = null;
	switch (sentence[1]) {
		case 'test':
			return await require('./interpretCommand.js').cm(test, userDb, false);
			break;
		case 'grant_s':
			tgUserDb = searchForAccount(sentence[2], db);
			if (tgUserDb == null) {
				return `Unauthenticated user @${sentence[2]}.`;
			} else {
				for (let i = 3; i < sentence.length; i++) {
					const types = ['blueberrySeeds', 'pinkTulipSeeds', 'strawberrySeeds', 'sunflowerSeeds', 'wheatSeeds'];
					tgUserDb.seedsInventory[types[i - 3]] += Math.round(sentence[i]);
				}
				dbFus.put(tgUserDb._id, tgUserDb);
				return `Granted specified seeds to @${sentence[2]}.`;
			}
			break;
		case 'grant_c':
			tgUserDb = searchForAccount(sentence[2], db);
			if (tgUserDb == null) {
				return `Unauthenticated user @${sentence[2]}.`;
			} else {
				for (let i = 3; i < sentence.length; i++) {
					const types = ['blueberryCrops', 'pinkTulipCrops', 'strawberryCrops', 'sunflowerCrops', 'wheatCrops'];
					tgUserDb.cropsInventory[types[i - 3]] += Math.round(sentence[i]);
				}
				dbFus.put(tgUserDb._id, tgUserDb);
				return `Granted specified crops to @${sentence[2]}.`;
			}
			break;

		default:
			return `Unrecognized mod command \`${sentence[1]}\`.`;
			break;
	}
};

module.exports.cm = async function (sentence, userDb, db) {
	return await cm(sentence, userDb, db);
};
