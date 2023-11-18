const generateFarmImg = require('../scripts/generateFarmImg.js');
const undoCamelCase = require('../scripts/undoCamelCase.js');

function inventoryContent(userDb) {
	let seedInventoryContent = userDb.seedsInventory;
	seedInventoryContent = Object.fromEntries(Object.entries(seedInventoryContent).sort(([, a], [, b]) => b - a));
	let cropInventoryContent = userDb.cropsInventory;
	cropInventoryContent = Object.fromEntries(Object.entries(cropInventoryContent).sort(([, a], [, b]) => b - a));

	let table = 'Seeds|Quantity|&ic; &ic; &ic; &ic; &ic; &ic; &ic;|Crops|Quantity\n-|-|-|-|-\n';
	for (let i = 0; i < Math.max(Object.keys(seedInventoryContent).length, Object.keys(cropInventoryContent).length); i++) {
		const seed = Object.keys(seedInventoryContent)[i] || '-';
		const crop = Object.keys(cropInventoryContent)[i] || '-';
		let seedKey = undoCamelCase.cm(seed);
		if (seed != '-') seedKey = '**' + seedKey.slice(0, seedKey.length - 6) + '** seeds';
		let cropKey = undoCamelCase.cm(crop);
		if (crop != '-') cropKey = '**' + cropKey.slice(0, cropKey.length - 6) + '** crops';
		table = table + `${seedKey}|${seedInventoryContent[seed] || '-'}||${cropKey}|${cropInventoryContent[crop] || '-'}\n`;
	}

	/* not devlp yet
        inventoryContent = userDb.specialItems;
        inventoryContent = Object.fromEntries(Object.entries(inventoryContent).sort(([, a], [, b]) => b - a));
        table = table + '\nSpecial Items|Quantity\n-|-\n';
        for (let item in inventoryContent) {
            table = table + `${undoCamelCase.cm(item)}|${inventoryContent[item]}\n`;
        }
    */

	return table;
}

let cm = async (sentence, userDb) => {
	if (sentence[1] == undefined) return `Valid **sub**commands for \`@FarmBot view\`:\n- \`farm\`: view your farm;\n- \`inventory\`: view your inventory content;\n- \`coins\`: view how many coins you have.`;
	else
		switch (sentence[1].toLowerCase()) {
			case 'farm':
				return `@${userDb.username}'s **farm**.\n\n${await generateFarmImg.generateFarmImg(userDb)}`;
				break;
			case 'inventory':
				return `@${userDb.username}'s **inventory**.\n\n${inventoryContent(userDb)}`;
				break;
			case 'coins':
				return `You have **${userDb.coins} coins**.`;
				break;
			default:
				return `Unrecognized subcommand \`${sentence[1]}\`.`;
				break;
		}
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
