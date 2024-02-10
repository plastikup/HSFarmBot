const generateFarmImg = require('../scripts/generateFarmImg.js');
const cropTypes = require('../constants.js').cropTypes;

let cm = async (sentence, userDb) => {
	let farm = userDb.farm;
	let spot = sentence[3] - 1;
	let seed = sentence[1].toLowerCase().substring(0, sentence[1].search(/(seeds?|)$/i));
	if (cropTypes._seed_types_regexp.test(seed) && userDb.seedsInventory[seed + 'seeds'] > 0 && spot >= 0 && spot < 9) {
		if (Math.floor(farm[spot].growthLevel) == 0 || Math.floor(farm[spot].growthLevel) == -1) {
			farm[spot].growthLevel = 1;
			farm[spot].plantedAt = Date.now();
			farm[spot].seedType = seed;
			farm[spot].secret = false;
			farm[spot].lastWater = Date.now();

			userDb.seedsInventory[seed + 'seeds']--;

			// planting anything successfully gives you exps
			userDb.experiences++;

			return [`Planted one cute **${seed} seed** to spot ${spot + 1}. Here's how your farm looks like now:\n\n${await generateFarmImg.generateFarmImg(userDb)}\n\nRemember to frequently water your farm (**every 8 hours**)!`, userDb];
		} else {
			return [`It looks like you have **already something planted there**.\n\n${await generateFarmImg.generateFarmImg(userDb)}`, userDb];
		}
	} else if (!cropTypes._seed_types_regexp.test(seed)) {
		return [`Unknown type of seed (\`${sentence[1]}\`).`, userDb];
	} else if (spot >= 0 && spot < 9) {
		return [`**You do not own any ${seed} seeds**. Reply with \`@FarmBot shop\` to buy some!`, userDb];
	} else {
		return [`Invalid spot ID (\`${sentence[3]}\`). **Top left starts at 1** and goes from left to right **until 9**.\nThe correct formatting of this command is: \`@FarmBot plant [seedname] spot [number]\`.`, userDb];
	}
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
