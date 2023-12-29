const generateFarmImg = require('../scripts/generateFarmImg.js');
const cts = require('../constants.js');
const newFarmDefault = cts.newFarmDefault;

let cm = async (sentence, userDb) => {
	if (sentence[2] < 1 || sentence[2] > 9 || sentence[2] === undefined) {
		return [`Invalid spot ID (\`${sentence[2]}\`). **Top left starts at 1** and goes from left to right **until 9**.\nThe correct formatting of this command is: \`@FarmBot harvest spot [number]\`.`, userDb];
	} else if (userDb.farm[sentence[2] - 1].seedType == null) {
		return [`There is **no crop at spot ${sentence[2]}**!\n\n${await generateFarmImg.generateFarmImg(userDb)}`, userDb];
	} else if (userDb.farm[sentence[2] - 1].growthLevel == -1) {
		return [`Your crop at spot ${sentence[2]} is **dead**.\n\n${await generateFarmImg.generateFarmImg(userDb)}\n\nRemember to **water your farm** frequently.`, userDb];
	} else if (Math.floor(userDb.farm[sentence[2] - 1].growthLevel) < 4) {
		return [`Your crop at spot ${sentence[2]} is **not ready to be harvested yet**!\n\n${await generateFarmImg.generateFarmImg(userDb)}`, userDb];
	} else {
		const targetCrop = userDb.farm[sentence[2] - 1].seedType;

		userDb.farm[sentence[2] - 1] = JSON.parse(newFarmDefault);
		userDb.cropsInventory[targetCrop + 'crops']++;

		if (userDb.farm.every((e) => e.seedType === null || e.growthLevel == -1)) userDb.lastWater = 0;

		return [`Harvested a gorgeous **${targetCrop}** from spot ${sentence[2]}! Earn coins by running \`@FarmBot sell ${targetCrop}\`, or keep it safe in your inventory as a sourvenir!\n\n${await generateFarmImg.generateFarmImg(userDb)}`, userDb];
	}
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
