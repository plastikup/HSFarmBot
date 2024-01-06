const dbAu = require('../dyna/dbAu.js');
const undoCamelCase = require('../scripts/undoCamelCase.js');
const formatCountdown = require('../scripts/formatCountdown.js');

let cm = async (sentence, userDb, devforced) => {
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
	let highestBidderID = auction.findIndex((e) => e.username == stats.username);
	let highestBidder = auction[highestBidderID] || { username: 'ZZZ-DU', bidAmount: 0, lastBidTS: Infinity };

	if (Date.now() >= baseAcc.endsAt) return [`The auction has **ended**! May the winner be announced somewhere soon in the future...\n\n<small>For some reasons, unfortunately the granting must be done manually by Tri-Angle. Thank you for your patience :<text>)`, userDb];

	if (sentence[1].toLowerCase() == 'reset') {
		if (userAccID == -1) return [`Nothing to reset - you have not bid anything yet!`, userDb];

		const returnedCoins = userAcc.bidAmount;
		userDb.coins += returnedCoins;
		userAcc.bidAmount = 0;
		await dbAu.put(userAcc._id, userAcc);

		return [`You have **reset your bids** and **${returnedCoins} coins** has been returned to your account.`, userDb];
	}

	const bidAmount = Number(sentence[1]);

	if (isNaN(bidAmount)) return ['Please enter a **digit** to bid.', userDb];
	else if (bidAmount < stats.bidAmount + 5) return [`You must bid **at least 5 coins higher than the leading bid** (which is currently **${stats.bidAmount} coins** - you will have to bid *at least* 5 more than that amount).`, userDb];
	else {
		if (bidAmount - userAcc.bidAmount > userDb.coins) {
			return [`You **do not have enough coins**. You need **${bidAmount - userAcc.bidAmount - userDb.coins} more** coins - you currently only have ${userDb.coins} (+ ${userAcc.bidAmount} coins that are in the auction bank).`, userDb];
		}
		if (userAcc.lastBidTS + 900000 > Date.now() && userAcc.lastBidTS !== Infinity) {
			if (!devforced) return [`You cannot bid twice within **15 minutes**. Try again in **${formatCountdown.cm(userAcc.lastBidTS + 900000)}**!`, userDb];
		}

		// extend by 12h everytime somebody bids when theres 24h left
		let endInMsg = 'The auction will **end in ' + formatCountdown.cm(baseAcc.endsAt) + '**!';
		if (baseAcc.endsAt - Date.now() < 86400000 && highestBidder.username !== userAcc.username && highestBidder.username !== 'ZZZ-DU') {
			baseAcc.endsAt += 43200000;
			endInMsg = 'Less than 24 hours left; therefore, **12 extra hours has been added** to the auction, making it **end in only ' + formatCountdown.cm(baseAcc.endsAt) + '**!! Quick, make sure to gather all your coins before it ends!';
			await dbAu.put(auction[baseAccID]._id, auction[baseAccID]);
		}
		// success; you have bid wtv amount
		if (userAccID == -1 || userAcc.bidAmount == 0) {
			if (userAccID == -1) {
				await dbAu.post(userDb.username, { username: userDb.username, bidAmount: bidAmount, lastBidTS: Date.now(), isBase: false });
			} else {
				await dbAu.put(userAcc._id, { username: userDb.username, bidAmount: bidAmount, lastBidTS: Date.now(), isBase: false });
			}
			userDb.coins -= bidAmount;

			if (highestBidder.username !== 'ZZZ-DU') {
				return [`You have bid **${bidAmount} coins**, and have **overtaken** @${stats.username}'s lead!\n\n@/${stats.username}, execute \`@FarmBot bid reset\` to get your coins back, or \`@FarmBot bid [amount]\` to add up to your previous bid!\n\n${endInMsg}`, userDb];
			} else {
				return [`You have bid **${bidAmount} coins**, and you are in the lead!\n\n${endInMsg}`, userDb];
			}
		} else {
			const oldBidAmount = userAcc.bidAmount;
			userAcc.bidAmount = bidAmount;
			userAcc.lastBidTS = Date.now();
			await dbAu.put(userAcc._id, userAcc);

			userDb.coins -= bidAmount - oldBidAmount;
			if (highestBidder.username === userAcc.username) {
				return [`You updated your old bid (${oldBidAmount} coins) **to ${bidAmount} coins**. See who's capable of overtaking you, ha!`, userDb];
			} else if (highestBidder.username !== 'ZZZ-DU') {
				return [`You have bid **${bidAmount} coins**, and have **overtaken** @${stats.username}'s lead!\n\n@/${stats.username}, execute \`@FarmBot bid reset\` to get your coins back, or \`@FarmBot bid [amount]\` to add up to your previous bid!\n\n${endInMsg}`, userDb];
			} else {
				return [`You have bid **${bidAmount} coins**, and you are in the lead!`, userDb];
			}
		}
	}
};

module.exports.cm = async function (sentence, userDb, devforced) {
	return await cm(sentence, userDb, devforced);
};
