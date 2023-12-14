const dbMs = require('../dyna/dbMs.js');
const undoCamelCase = require('../scripts/undoCamelCase.js');

let cm = async (sentence, userDb) => {
	let mooseFarms = await dbMs.get();
	let existingPacks = [];
	for (const item of mooseFarms) {
		existingPacks.push(item.packName);
	}
	if (!existingPacks.includes(sentence[1])) {
		return [`Invalid pack name \`${sentence[1]}\`. Reply with \`@FarmBot shop list\` for a detailed list of available products.`, userDb];
	} else {
		const targetPack = mooseFarms[existingPacks.indexOf(sentence[1])];
		if (userDb.coins >= targetPack.packPrice) {
			const randomNumb = Math.floor(Math.random() * 100);
			let luckCount = 0;
			let i = 0;
			for (const seed of targetPack.packContent) {
				if (seed.luck + luckCount > randomNumb) break;
				luckCount += seed.luck;
				i++;
			}
			const randomSeed = targetPack.packContent[i];

			const isDouble = Math.floor(Math.random() * 10) == 0 && randomSeed.luck >= 15;

			userDb.coins -= targetPack.packPrice;
			userDb.seedsInventory[randomSeed.seedName + 'Seeds'] += isDouble + 1;

			if (isDouble) {
				return [`You bought one \`${targetPack.packName}\`, and... drum roll please! \n\n\u2757\u2757\u2757 \n\nYou opened your package and found **[u]TWO[/u] [spoiler]${randomSeed.seedName} seeds[/spoiler]**, both with a **${randomSeed.luck}% drop chance**!! The duplicate has a **10% chance** of happening. Wow, congrats!`, userDb];
			} else {
				return [`You bought one \`${targetPack.packName}\`, and... drum roll please! \n\n\uD83E\uDD41\uD83E\uDD41 \n\nYou opened your package and found **one [spoiler]${randomSeed.seedName} seed[/spoiler]**, with a **${randomSeed.luck}% drop chance**!!`, userDb];
			}
		} else {
			return [`You **don't have enough coins** to buy this pack (**${targetPack.packPrice} coins**). You currently have **${userDb.coins} coins** in your account.`, userDb];
		}
	}
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
