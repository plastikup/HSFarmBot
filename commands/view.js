const generateFarmImg = require('../scripts/generateFarmImg.js');

function inventoryContent(userDb) {
	let inventoryContent = userDb.seedsInventory;
	inventoryContent = Object.fromEntries(Object.entries(inventoryContent).sort(([, a], [, b]) => b - a));
	let table = 'Seeds|Quantity\n-|-\n';
	for (let item in inventoryContent) {
		table = table + `${item.replace(/([a-z])([A-Z])/g, (m0, m1, m2) => m1 + ' ' + m2).replace(/^[a-z]/, (m) => m.toUpperCase())}|${inventoryContent[item]}\n`;
	}

	inventoryContent = userDb.cropsInventory;
	inventoryContent = Object.fromEntries(Object.entries(inventoryContent).sort(([, a], [, b]) => b - a));
	table = table + '\nCrops|Quantity\n-|-\n';
	for (let item in inventoryContent) {
		table = table + `${item.replace(/([a-z])([A-Z])/g, (m0, m1, m2) => m1 + ' ' + m2).replace(/^[a-z]/, (m) => m.toUpperCase())}|${inventoryContent[item]}\n`;
	}

	/* not devlp yet
        inventoryContent = userDb.specialItems;
        inventoryContent = Object.fromEntries(Object.entries(inventoryContent).sort(([, a], [, b]) => b - a));
        table = table + '\nSpecial Items|Quantity\n-|-\n';
        for (let item in inventoryContent) {
            table = table + `${item.replace(/([a-z])([A-Z])/g, (m0, m1, m2) => m1 + ' ' + m2).replace(/^[a-z]/, (m) => m.toUpperCase())}|${inventoryContent[item]}\n`;
        }
        */

	return table;
}

let cm = async (sentence, userDb) => {
	if (sentence[1] == undefined) return `Valid subcommands for \`@FarmBot view\`:\n- \`farm\`: view your farm;\n- \`inventory\`: view your inventory content;\n- \`coins\`: view how many coins you have.`;
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
