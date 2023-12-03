const formatCountdown = require('../scripts/formatCountdown.js');

let cm = async (userDb, devforced) => {
	let lastDaily = userDb.lastDaily;
	if (Date.now() > lastDaily + 82800000 || devforced) {
		userDb.lastDaily = Date.now();
		if (Math.random() >= 0.98){
			// 2% chance of getting a lilyValley drop
			userDb.seedsInventory.lilyValleySeeds += 1;

			return [`Granted... \u2757\u2757 **1 Lily Valley seed** to your account!! This drop has a 2% drop chance.\n\nCome back in **23 hours** to request another \`@FarmBot daily\`!`, userDb];
		} else {
			const randomGrant = Math.round(Math.random() * 25 + 15);
			userDb.coins += randomGrant;
	
			return [`Granted... \uD83E\uDD41\uD83E\uDD41 **${randomGrant} coins** to your account! Come back in **23 hours** to request another \`@FarmBot daily\`!`, userDb];
		}
	} else {
		return [`You have recently requested a **daily**. Try again in **${formatCountdown.cm(lastDaily + 82800000)}**!`, userDb];
	}
};

module.exports.cm = async function (userDb, devforced) {
	return await cm(userDb, devforced);
};
