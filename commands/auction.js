//const cropTypes = require('../constants.js').cropTypes;
const dbAu = require('../dyna/dbAu.js');
const undoCamelCase = require('../scripts/undoCamelCase.js');
const formatCountdown = require('../scripts/formatCountdown.js');
const auctionFormatting = require('../scripts/auctionFormatting.js');

let cm = async (sentence, userDb) => {
	if (sentence[1] == undefined) return [`Valid subcommands for \`@FarmBot auction\`:\n- \`view\`: view the current ongoing auction happening;\n- \`bid [amount]\`: bid an amount of coins on the ongoing auction.`, userDb];
	else {
		let auction = await dbAu.get();

		const baseAccID = auction.findIndex((e) => e.username === 'ZZZ-DU');
		if (baseAccID == -1) return [`**critical: baseAcc not found.**\n\n@Tri-Angle`, userDb];
		let baseAcc = auction[baseAccID].bidSettings;

		let stats = { username: 'DEFAULT_MIN_BID_AMOUNT', bidAmount: 5 };
		for (let i = 0; i < auction.length; i++) {
			if (i == baseAccID) continue;
			const raw = auction[i];
			if (raw.bidAmount > stats.bidAmount) {
				stats.username = raw.username;
				stats.bidAmount = raw.bidAmount;
			}
		}

		let userAccID = auction.findIndex((e) => e.username == userDb.username);
		let userAcc = auction[userAccID] || { username: 'ZZZ-DU', bidAmount: 0, lastBidTS: Infinity };

		switch (sentence[1].toLowerCase()) {
			case 'view':
				if (!baseAcc._active) return [`There is no ongoing auction right now. Check it again in a day or two!`, userDb];

				if (Date.now() >= baseAcc.endsAt) return [`The auction has **ended**! May the winner be announced somewhere soon in the future...\n\n<small>For some reasons, unfortunately the granting must be done manually by Tri-Angle. Thank you for your patience :<text>)`, userDb];

				let yourBidText = 'You have not bid anything yet.';
				if (userAccID != -1) {
					if (stats.username == userDb.username) yourBidText = 'You are in the lead!';
					else yourBidText = `You have bid ${userAcc.bidAmount} coins. It's not enough to win the auction!`;
				}

				return [`### Status of current ongoing auction\n${auctionFormatting.cm(baseAcc.bidSubject.subject, stats.bidAmount, stats.username, baseAcc.endsAt)}\n\n${yourBidText}`, userDb];
				break;
			case 'bid':
				if (Date.now() >= baseAcc.endsAt) return [`The auction has **ended**! May the winner be announced somewhere soon in the future...\n\n<small>For some reasons, unfortunately the granting must be done manually by Tri-Angle. Thank you for your patience :<text>)`, userDb];

				if (sentence[2].toLowerCase() == 'reset') {
					if (userAccID == -1) return [`Nothing to reset - you have not bid anything yet!`, userDb];

					userDb.coins += userAcc.bidAmount;
					await dbAu.delete(userAcc._id);

					return [`You have **reset your bids** and **${userAcc.bidAmount} coins** has been returned to your account.`, userDb];
				}

				const bidAmount = Number(sentence[2]);

				if (isNaN(bidAmount)) return ['Please enter a **digit** to bid.', userDb];
				else if (bidAmount < stats.bidAmount + 5) return [`You must bid **at least 5 coins higher than the leading bid** (which is currently **${stats.bidAmount} coins** - you will have to bid *at least* 5 more than that amount).`, userDb];
				else {
					if (bidAmount - userAcc.bidAmount > userDb.coins) {
						return [`You **do not have enough coins**. You need **${bidAmount - userAcc.bidAmount - userDb.coins} more** coins - you currently only have ${userDb.coins}.`, userDb];
					} else if (userAccID == -1) {
						await dbAu.post(userDb.username, { username: userDb.username, bidAmount: bidAmount, lastBidTS: Date.now(), isBase: false });
						userDb.coins -= bidAmount;
						return [`You have bid **${bidAmount} coins**, and have **overtaken** @${stats.username}'s lead!`, userDb];
					} else {
						if (userAcc.lastBidTS + 82800000 > Date.now()) {
							return [`You cannot bid twice within **23 hours**. Try again in **${formatCountdown.cm(userAcc.lastBidTS + 82800000)}**!`, userDb];
						}

						const oldBidAmount = userAcc.bidAmount;
						userAcc.bidAmount = bidAmount;
						userAcc.lastBidTS = Date.now();
						await dbAu.put(userAcc._id, userAcc);

						userDb.coins -= bidAmount - oldBidAmount;
						return [`You updated your old bid (${oldBidAmount} coins) **to ${bidAmount} coins**. See who's capable of overtaking you, ha!`, userDb];
					}
				}
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
