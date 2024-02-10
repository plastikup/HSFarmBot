const generateFarmImg = require('../scripts/generateFarmImg.js');
const cropTypes = require('../constants.js').cropTypes;

module.exports = async function (sentence, userDb) {
	if (sentence[1] == undefined) return [`Valid **sub**commands for \`@FarmBot garden\`:\n- \`transplant [cropname] spot [number]\`: transplant a crop from your inventory;\n- \`remove spot [number]\`: remove a crop from your garden, to place it safely in your inventory;`, userDb];
	if (sentence.length < 5) return [`The correct formatting of this command is: \`@FarmBot garden transplant [cropname] spot [number]\``, userDb];

	const garden = userDb.garden;
	// find the extremum and the target spot
	let spot = 0;
	let maxSpotId = 0;
	for (let i = 0, j = 0; i < garden.length; i++) {
		if (garden[i].locked === false) {
			maxSpotId++;
			j++;
		}
		if (j <= +sentence[4] - 1) {
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
	} else if (sentence[1] === 'remove') {
		//
	}

	return ['default answer', userDb];
};
