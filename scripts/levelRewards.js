const dbMs = require('../dyna/dbMs.js');
const cts = require('../constants.js');
const randomGrant = require('../commands/buy.js').randomGrant;

module.exports = async (answer, userDb, newLevel) => {
	let mooseFarms = await dbMs.get();
	let rewardMsg = `# <kbd>:partying_face: :tada: NEW LEVEL REACHED :partying_face: :tada:</kbd>\n@${userDb.username}, you have reached **level ${newLevel}**! *Huge* congratulations!\n\nHere are your reward(s):`;

	const levelRewards = cts.rewardsList[newLevel];

	for (const reward of levelRewards) {
		if (reward.category === 'coins') {
			rewardMsg += `\n-> **${reward.quantity} coins**;`;

			userDb.coins += reward.quantity;
		} else if (reward.category === 'moosefarmpacks') {
			let randomSeed = randomGrant(mooseFarms.filter((el) => el.packName === reward.name)[0]);
			rewardMsg += `\n-> :drum::drum: … granted **[spoiler]${reward.quantity} ${randomSeed.itemName}seed[/spoiler]**!`;

			userDb.seedsInventory[randomSeed.itemName + 'seeds'] += reward.quantity;
		} else if (reward.category === 'miscellaneous') {
			rewardMsg += `\n-> **${reward.quantity} ${reward.name}**;`;

			userDb.miscellaneousInventory[reward.name] += reward.quantity;
		} else if (reward.category === 'message') {
			rewardMsg += '\n-> ' + reward.message;
		}
	}

	rewardMsg += "\n\nHappy farmin'! :farmer::basket:";
	answer += '\n___\n' + rewardMsg;

	return [answer, userDb, newLevel];
};
