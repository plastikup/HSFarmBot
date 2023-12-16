const dbFus = require('../dyna/dbFus.js');
const dbAu = require('../dyna/dbAu.js');
const test = require('../constants.js').test;
const auctionFormatting = require('../scripts/auctionFormatting.js');

module.exports = async (sentence, userDb, db) => {
	let tgUserDb = null;
	switch (sentence[1]) {
		case 'test':
			return await require('./interpretCommand.js').cm(test, userDb, false);
			break;
		case 'grant_s':
			tgUserDb = require('../scripts/searchForAccount')(sentence[2], db);
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
			tgUserDb = require('../scripts/searchForAccount')(sentence[2], db);
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
		case 'start_auction':
			await dbAu.put(process.env.baseID, {
				bidSettings: {
					_active: true,
					endsAt: Date.now() + Number(sentence[4]) * 86400000,
					bidSubject: {
						subject: sentence[3],
						amount: Number(sentence[2]),
					},
				},
			});
			await dbAu.delete('*?q={"isBase": false}');
			return `\n# A NEW AUCTION HAS SPAWNED\n\n${auctionFormatting.cm(sentence[3], Number(sentence[2]), 'DEFAULT_MIN_BID_AMOUNT', Date.now() + Number(sentence[4]) * 86400000)}`;
			break;

		default:
			return `Unrecognized mod command \`${sentence[1]}\`.`;
			break;
	}
};
