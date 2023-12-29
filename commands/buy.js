const dbMs = require('../dyna/dbMs.js');
const undoCamelCase = require('../scripts/undoCamelCase.js');

let cm = async (sentence, userDb) => {
	async function formatPackAnswer() {
		if (!existingPacks.includes(inputPack)) {
			return `Invalid pack name \`${sentence[1]}\`. Reply with \`@FarmBot view shop\` for a detailed list of available products.`;
		} else {
			const targetPack = mooseFarms[existingPacks.indexOf(inputPack)];
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
				userDb.seedsInventory[randomSeed.seedName + 'seeds'] += isDouble + 1;

				if (isDouble) {
					return `You bought one \`${targetPack.packName}\`, and... drum roll please! \n\n\u2757\u2757\u2757 \n\nYou opened your package and found **[u]TWO[/u] [spoiler]${randomSeed.seedName} seeds[/spoiler]**, both with a **${randomSeed.luck}% drop chance**!! The duplicate has a **10% chance** of happening. Wow, congrats!`;
				} else {
					return `You bought one \`${targetPack.packName}\`, and... drum roll please! \n\n\uD83E\uDD41\uD83E\uDD41 \n\nYou opened your package and found **one [spoiler]${randomSeed.seedName} seed[/spoiler]**, with a **${randomSeed.luck}% drop chance**!!`;
				}
			} else {
				return `You **don't have enough coins** to buy this pack (**${targetPack.packPrice} coins**). You currently have **${userDb.coins} coins** in your account.`;
			}
		}
	}

	let mooseFarms = await dbMs.get();
	let inputPack, nbBought;
	if (sentence.length == 2) {
		inputPack = sentence[1].toLowerCase().substring(0, sentence[1].search(/s?$/i));
		nbBought = 1;
	} else {
		if (isNaN(+sentence[1])) {
			return [`I do not understand what buying '\`${sentence[1]}\`' packs of ${sentence[2]} means. Please give an integer between 1 to 5.\nThe correct formatting of this command is: \`@FarmBot buy [number](OPTIONAL) [packname]\`.`, userDb];
		} else {
			inputPack = sentence[2].toLowerCase().substring(0, sentence[2].search(/s?$/i));
			nbBought = Math.max(Math.min(+sentence[1], 5), 1);
		}
	}
	let existingPacks = [];
	for (const item of mooseFarms) {
		existingPacks.push(item.packName);
	}

	let answer = '';

	for (let i = 0; i < nbBought; i++) {
		answer += (await formatPackAnswer()) + '\n\n___\n\n';
	}
	return [answer, userDb];
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
