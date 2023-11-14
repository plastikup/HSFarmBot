//const cropTypes = require('../constants.js').cts().cropTypes;
const dbAu = require('../dyna/dbAu.js').dbAu();
const auctionHelp = require('../constants.js').cts().auctionHelp;
const undoCamelCase = require('../scripts/undoCamelCase.js');
const formatCountdown = require('../scripts/formatCountdown.js');

let cm = async (sentence, userDb) => {
	if (sentence[1] == undefined) return [`Valid subcommands for \`@FarmBot auction\`:\n- \`help\`: What's an auction, what's a bid? Everything you need to know before getting started;\n- \`view\`: view the current ongoing auction happening;\n- \`bid [amount]\`: bid an amount of coins on the ongoing auction.`, userDb];
	else {
		let auction = await dbAu.get();

		const baseAccID = auction.findIndex((e) => e.username === 'ZZZ-DU');
		if (baseAccID == -1) return [`**critical: baseAcc not found.**\n\n@Tri-Angle`, userDb];
		let baseAcc = auction[baseAccID].bidSettings;

		const userAccID = auction.findIndex((e) => e.username == userDb.username);
		let userAcc = auction[userAccID];

		switch (sentence[1].toLowerCase()) {
			case 'help':
				return [auctionHelp, userDb];
				break;
			case 'view':
				if (!baseAcc._active) return [`There is no ongoing auction right now. Check it again in a day or two!`, userDb];

				let yourBidText = 'You have not bidden anything yet.';
				if (userAccID != -1) {
					if (baseAcc.highestBid.username == userDb.username) yourBidText = 'You are in the lead!';
					else yourBidText = `You have bidden ${userAcc.bidAmount} coins. It's not enough to win the auction!`;
				}

				return [`### Status of current ongoing auction\n> \uD83D\uDD0D **Bidding subject**: ${undoCamelCase.cm(baseAcc.bidSubject.subject)}\n> \uD83D\uDCB0 **Highest bid so far**: ${baseAcc.highestBid.amount} coins (by ${baseAcc.highestBid.username})\n> \u23F3 **Ends in**: ${formatCountdown.cm(baseAcc.endsAt + 82800000)}\n\n${yourBidText}`, userDb];
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
