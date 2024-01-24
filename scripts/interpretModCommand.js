const dbFus = require('../dyna/dbFus.js');
const dbAu = require('../dyna/dbAu.js');
const cts = require('../constants.js');
const auctionFormatting = require('../scripts/auctionFormatting.js');

module.exports = async (sentence, userDb, db, cooked) => {
	let tgUserDb = null;
	switch (sentence[1]) {
		case 'version':
			return `The active version of the bot is currently **${cts.botVersion}**.`;
			break;
		case 'allfarmers':
			const allFarmersRaw = db
				.map((user) => user.username)
				.filter((username) => !/(ZZZ-DU|TriAngleHSFBTester)/.test(username))
				.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
				.map((username) => '@' + username);

			const allFarmers = JSON.stringify(allFarmersRaw)
				.replace(/["\[\]]/g, '')
				.replace(/,/g, ' ');

			return `\n\n\`${allFarmers}\``;
			break;
		case 'viewRaw':
			return `\n\n\`${cooked}\``;
			break;
		case 'startauction':
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
			return `\n# A NEW AUCTION HAS SPAWNED\n\n${auctionFormatting.cm(sentence[3], Number(sentence[2]), 5, 'DEFAULT_MIN_BID_AMOUNT', Date.now() + Number(sentence[4]) * 86400000)}`;
			break;

		default:
			return `Unrecognized mod command \`${sentence[1]}\`.\n\nValid **sub**commands for \`@FarmBot ::mod\`:\n- \`version\`: get the version of the bot;\n- \`allfarmers\`: get a list of every farmers;\n- \`viewRaw\`: post the HTML raw version of the post; \n- \`startauction [amount] [seed/crop/decorativeelement] [ending timestamp]\`: start a new auction! `;
			break;
	}
};
