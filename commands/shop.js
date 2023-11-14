const dbMs = require('../dyna/dbMs.js').dbMs();
const undoCamelCase = require('../scripts/undoCamelCase.js');

let cm = async (sentence, userDb) => {
	if (sentence[1] == undefined) {
		return [`Valid **sub**commands for \`@FarmBot shop\`:\n- \`list\`: display your shopping list (what you can buy at MooseFarms Co.);\n- \`buy [item]\`: buy an item from your shopping list.`, userDb];
	} else {
		let mooseFarms = await dbMs.get();
		switch (sentence[1].toLowerCase()) {
			case 'list':
				let table = `Pack name|Content & luck|Price\n-|-|-\n`;
				for (const item of mooseFarms) {
					console.log(item);
					table += `${undoCamelCase.cm(item.packName)}|`;
					for (const seed of item.packContent) {
						table += `${undoCamelCase.cm(seed.seedName)}: **${seed.luck}%**<br>`;
					}
					table += `|${item.packPrice}\n`;
				}
				return [`### MooseFarms Co.'s products\n\n${table}`, userDb];
				break;
			case 'buy':
				let existingPacks = [];
				for (const item of mooseFarms) {
					existingPacks.push(item.packName);
				}
				if (!existingPacks.includes(sentence[2])) {
					return [`Invalid pack name \`${sentence[2]}\`. Reply with \`@FarmBot shop list\` for a detailed list of available products.`, userDb];
				} else {
					const targetPack = mooseFarms[existingPacks.indexOf(sentence[2])];
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
				break;
			default:
				return [`Unrecognized subcommand \`${sentence[1]}\`.`, userDb];
				break;
		}
	}
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
