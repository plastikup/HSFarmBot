const generateFarmImg = require('../scripts/generateFarmImg.js');
const cropTypes = require('../constants.js').cropTypes;

module.exports = async function (sentence, userDb) {
	if (sentence[1] === undefined || (sentence[1] !== 'transplant' && sentence[1] !== 'remove')) return [`Valid **sub**commands for \`@FarmBot garden\`:\n- \`transplant [cropname] spot [number]\`: transplant a crop from your inventory;\n- \`remove spot [number]\`: remove a crop from your garden, to place it safely in your inventory;`, userDb];

	const garden = userDb.garden;
	// find the extremum and the target spot
	let spot = 0;
	let maxSpotId = 0;
	for (let i = 0, j = 0; i < garden.length; i++) {
		if (garden[i].locked === false) {
			maxSpotId++;
			j++;
		}
		if (j <= (sentence[1] === 'transplant' ? +sentence[4] : +sentence[3]) - 1) {
			spot++;
		}
	}

	if (sentence[1] === 'transplant') {
		const crop = sentence[2].toLowerCase().substring(0, sentence[2].search(/(crops?|)$/i));

		// reject if user attempts to plant a seed
		if (/seeds?$/.test(crop)) return [`The garden is **to showcase your crops**. You cannot plant seeds there - **use your farm** instead!`, userDb];
		// reject if unknown crop
		if (!cropTypes._seed_types_regexp.test(crop)) return [`Unknown type of crop (\`${sentence[2]}\`).`, userDb];
		// reject if no such crop in the inventory
		if (userDb.cropsInventory[crop + 'crops'] <= 0) return [`**You do not own any ${crop} crops**. Reply with \`@FarmBot shop\` to buy some!`, userDb];
		// reject if spot is outside garden range
		if (spot >= maxSpotId) return [`Invalid spot ID (\`${sentence[4]}\`). **Top left starts at 1** and goes from left to right **until ${maxSpotId}**.\nThe correct formatting of this command is: \`@FarmBot garden transplant [cropname] spot [number]\`.`, userDb];
		// reject if there is something there already
		if (garden[spot].seedType !== null) return [`It looks like you have **already something planted there**.\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`, userDb];
		// process-error
		if (garden[spot].locked === true) return ['process-error - locked\n@Tri-Angle', userDb];

		// proceed!
		userDb.cropsInventory[crop + 'crops']--;
		garden[spot].seedType = crop;
		garden[spot].plantedAt = Date.now();

		return [`Transplanted one gorgeous **${crop} plant** to spot ${sentence[4]}. Here's how your awesome garden looks like now 🪴\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`, userDb];
	} else {
		// reject if nothing there
		if (garden[spot].seedType === null) return [`There is **no plant at spot ${sentence[3]}**!\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`, userDb];

		// proceed!
		const targetCrop = garden[spot].seedType;
		userDb.cropsInventory[targetCrop + 'crops']++;
		garden[spot].seedType = null;
		garden[spot].plantedAt = null;

		return [`Removed a gorgeous **${targetCrop}** from spot ${sentence[3]}!\n\n${await generateFarmImg.generateFarmImg(userDb, true)}\n\nEarn coins by running \`@FarmBot sell ${targetCrop}\`, transplant it back to your garden by running \`@FarmBot garden plant ${targetCrop} spot [number]\`, or keep it safe in your inventory as a souvenir!`, userDb];
	}
};
