//const cropTypes = require('../constants.js').cts().cropTypes;
const dbAu = require('../dyna/dbAu.js').dbAu();
const auctionHelp = require('../constants.js').cts().auctionHelp;

let cm = async (sentence, userDb) => {
	if (sentence[1] == undefined) return [`Valid subcommands for \`@FarmBot auction\`:\n- \`help\`: What's an auction, what's a bid? Everything you need to know before getting started;\n- \`info\`: view the current ongoing auction happening;\n- \`bid [amount]\`: bid an amount of coins on the ongoing auction.`, userDb];
	else {
		let auction = await dbAu.get();

		const i = auction.findIndex((e) => e.username === 'ZZZ-DU');
		if (i == -1) return [`**critical: baseAcc not found.**\n\n@Tri-Angle`, userDb];
		let baseAcc = auction[i];

		switch (sentence[1].toLowerCase()) {
			case 'help':
				return [auctionHelp, userDb];
				break;
			case 'info':
				if (!baseAcc.bidSettings._active) return [`There is no ongoing auction right now. Check it again in a day or two!`, userDb];

				return [`### Status of current ongoing auction\n> \uD83D\uDD0D **Bidding subject**: [element]\n> \uD83D\uDCB0 **Highest bid so far**: [number] by [user]\n> \u23F3 **Ends in**: [date]`, userDb];
				break;
			case 'bid':
				return [`[bidding coming soon]`, userDb];
				break;

			default:
				return [`Unrecognized subcommand \`${sentence[1]}\`.`, userDb];
				break;
		}
	}
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
