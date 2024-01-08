const dbFus = require('../dyna/dbFus.js');
const dbAu = require('../dyna/dbAu.js');
const test = require('../constants.js').test;
const auctionFormatting = require('../scripts/auctionFormatting.js');

module.exports = async (sentence, userDb, db) => {
	let tgUserDb = null;
	switch (sentence[1]) {
		case 'version':
			return 'The active version of the bot is currently v2024.0b.';
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
			return `\n# A NEW AUCTION HAS SPAWNED\n\n${auctionFormatting.cm(sentence[3], Number(sentence[2]), 5,'DEFAULT_MIN_BID_AMOUNT', Date.now() + Number(sentence[4]) * 86400000)}`;
			break;

		default:
			return `Unrecognized mod command \`${sentence[1]}\`.`;
			break;
	}
};
