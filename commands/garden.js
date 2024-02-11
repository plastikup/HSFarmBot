const generateFarmImg = require('../scripts/generateFarmImg.js');
const cts = require('../constants.js');

module.exports = async function (sentence, userDb, db) {
	if (sentence[1] === undefined || (sentence[1] !== 'place' && sentence[1] !== 'remove' && sentence[1] !== 'visit')) return [`Valid **sub**commands for \`@FarmBot garden\`:\n- \`place [cropname|decorationname] spot [number]\`: transplant a crop from your inventory;\n- \`remove spot [number]\`: remove a crop from your garden, to place it safely in your inventory;\n- \`visit [username]\`: go visit your friends!`, userDb];

	const garden = userDb.garden;
	// find the extremum and the target spot
	let spot = 0;
	let maxSpotId = 0;
	for (let i = 0, j = 0; i < garden.length; i++) {
		if (garden[i].locked === false) {
			maxSpotId++;
			j++;
		}
		if (j <= (sentence[1] === 'place' ? +sentence[4] : +sentence[3]) - 1) {
			spot++;
		}
	}

	if (sentence[1] === 'place') {
		const item = sentence[2].toLowerCase().substring(0, sentence[2].search(/(crops?|)$/i));

		// determine item type
		let itemType;
		if (cts.cropTypes._seed_types_regexp.test(item)) itemType = 'crop';
		else if (cts.decoTypes._deco_types_regexp.test(item)) itemType = 'deco';
		else return [`The garden is **to showcase your crops and your decorations**. The item name you gave is **unrecognized**. Moreover, you cannot plant seeds there - **use your farm** instead!`, userDb];
		// reject if no such crop or item in the inventory
		if (itemType === 'crop') {
			if (userDb.cropsInventory[item + 'crops'] <= 0) return [`**You do not own any ${item} crops**. Reply with \`@FarmBot shop\` to buy some!`, userDb];
		} else {
			if (userDb.miscellaneousInventory[item] <= 0) return [`**You do not own any ${item}**. Reply with \`@FarmBot shop\` to buy some!`, userDb];
		}
		// reject if spot is outside garden range
		if (spot > maxSpotId) return [`Invalid spot ID (\`${sentence[4]}\`). **Top left starts at 1** and goes from left to right **until ${maxSpotId}**.\nThe correct formatting of this command is: \`@FarmBot garden place [cropname|decorationname] spot [number]\`.`, userDb];
		// reject if there is something there already
		if (garden[spot].seedType !== null) return [`It looks like you have **already something there**.\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`, userDb];
		// process-error
		if (garden[spot].locked === true) return ['process-error - undefined429\n@Tri-Angle', userDb];

		// proceed!
		if (itemType === 'crop') userDb.cropsInventory[item + 'crops']--;
		else userDb.miscellaneousInventory[item]--;
		garden[spot].seedType = item;
		garden[spot].plantedAt = Date.now();

		if (itemType === 'crop') {
			return [`Placed one gorgeous **${item} plant** to spot ${sentence[4]}. Here's how your awesome garden looks like now 🪴\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`, userDb];
		} else {
			return [`Placed one imposing **${item}** to spot ${sentence[4]}. Here's how your awesome garden looks like now 🪴\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`, userDb];
		}
	} else if (sentence[1] === 'remove') {
		// reject if nothing there
		if (garden[spot].seedType === null) return [`There is **no plant/deco at spot ${sentence[3]}**!\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`, userDb];

		// proceed!
		let itemType;
		const item = garden[spot].seedType;
		if (cts.cropTypes._seed_types_regexp.test(item)) {
			itemType = 'crop';
			userDb.cropsInventory[item + 'crops']++;
		} else if (cts.decoTypes._deco_types_regexp.test(item)) {
			itemType = 'deco';
			userDb.miscellaneousInventory[item]++;
		} else return ['process-error - undefined028\n@Tri-Angle', userDb];
		garden[spot].seedType = null;
		garden[spot].plantedAt = null;

		if (itemType === 'crop') {
			return [`Removed a gorgeous **${item} plant** from spot ${sentence[3]}!\n\n${await generateFarmImg.generateFarmImg(userDb, true)}\n\nEarn coins by running \`@FarmBot sell ${item}\`, place it back in your garden by running \`@FarmBot garden place ${item} spot [number]\`, or keep it safe in your inventory as a souvenir!`, userDb];
		} else {
			return [`Removed a imposing **${item}** from spot ${sentence[3]}!\n\n${await generateFarmImg.generateFarmImg(userDb, true)}\n\nPlace it back in your garden by running \`@FarmBot garden place ${item} spot [number]\`, or keep it safe in your inventory as a souvenir!`, userDb];
		}
	} else {
		const landlord = sentence[2];
		const landlordDb = require('../scripts/searchForAccount.js')(landlord, db);

		// reject if its yourself
		if (landlordDb === userDb) return ["Hey you can't visit yourself, silly 😛", userDb];
		// reject if unknown landlord
		if (landlordDb === null) return [`The is **no such farmer** under the username \`${landlord}\`.`, userDb];
		// reject if they have no garden or is not at level 3 yet
		if (!(landlordDb.garden?.length > 0) || require('../commands/level.js').calcUserLevel(landlordDb.experiences) < 3) return [`The farmer you tried to visit (\`${landlord}\`) **has no garden yet**! Come back visit another day.`, userDb];

		// proceed!
		if (landlordDb.dbVersion !== cts.botVersion) {
			let gardenImg;
			try {
				gardenImg = await generateFarmImg.generateFarmImg(landlordDb, true);
			} catch (error) {
				gardenImg = '[image]';
			}
			return [`@/${landlord}'s awesome garden:\n\n${gardenImg}\n\n**Note**: the farmer you visited has a garden version older than yours. Some plants, decos, or even grass may display improperly.`, userDb];
		} else {
			return [`@/${landlord}'s awesome garden:\n\n${await generateFarmImg.generateFarmImg(landlordDb, true)}`, userDb];
		}
	}
};
