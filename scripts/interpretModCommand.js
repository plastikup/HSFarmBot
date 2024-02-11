const dbAu = require('../dyna/dbAu.js');
const cts = require('../constants.js');
const auctionFormatting = require('../scripts/auctionFormatting.js');
const callAllFarmers = require('../scripts/callAllFarmers.js');

module.exports = async (sentence, userDb, db, cooked) => {
	switch (sentence[1]) {
		case 'version':
			return `The active version of the bot is currently **${cts.botVersion}**.`;
		case 'allfarmers':
			return `\n\n\`${await callAllFarmers(db)}\``;

		case 'viewRaw':
			return `\n\n\`\`\`\n${cooked}\n\`\`\``;
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

		default:
			return `Unrecognized mod command \`${sentence[1]}\`.\n\nValid **sub**commands for \`@FarmBot ::mod\`:\n- \`version\`: get the version of the bot;\n- \`allfarmers\`: get a list of every farmers;\n- \`viewRaw\`: post the HTML raw version of the post; \n- \`startauction [amount] [seed/crop/deco] [ending timestamp]\`: start a new auction! `;
	}
};
