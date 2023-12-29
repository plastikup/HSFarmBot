const generateFarmImg = require('../scripts/generateFarmImg.js');
const undoCamelCase = require('../scripts/undoCamelCase.js');
const dbMs = require('../dyna/dbMs.js');
const dbAu = require('../dyna/dbAu.js');
const auctionFormatting = require('../scripts/auctionFormatting.js');

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
		if (seed != '-') seedKey = '**' + seedKey.slice(0, seedKey.length - 5) + '** seeds';
		let cropKey = undoCamelCase.cm(crop);
		if (crop != '-') cropKey = '**' + cropKey.slice(0, cropKey.length - 5) + '** crops';
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
	if (sentence[1] == undefined) return `Valid **sub**commands for \`@FarmBot view\`:\n- \`farm\`: view your farm;\n- \`inventory\`: view your inventory content;\n- \`shop\`: display the items available in your dream shop, MooseFarms Co.!;\n- \`auction\`: display the infos about the current ongoing auction`;
	else
		switch (sentence[1].toLowerCase()) {
			case 'farm':
				return `@/${userDb.username}'s **farm**.\n\n${await generateFarmImg.generateFarmImg(userDb)}`;
				break;
			case 'inventory':
				return `@/${userDb.username}'s **inventory** - you have **${userDb.coins} coins**.\n\n${inventoryContent(userDb)}`;
				break;
			case 'coins':
				return `This is a **deprecated command** - it has been merged with \`@FarmBot view inventory\`.`;
				break;
			case 'shop':
				let mooseFarms = await dbMs.get();
				let table = `Pack name|Content & luck|Price\n-|-|-\n`;
				for (const item of mooseFarms) {
					table += `\`${item.packName}\`|`;
					for (const seed of item.packContent) {
						table += `${seed.seedName}: **${seed.luck}%**<br>`;
					}
					table += `|${item.packPrice}\n`;
				}
				return `### MooseFarms Co.'s products\n\n${table}\n\nYou have **${userDb.coins} coins**.`;
				break;
			case 'auction':
				let auction = await dbAu.get();

				const baseAccID = auction.findIndex((e) => e.username === 'ZZZ-DU');
				if (baseAccID == -1) return `**critical: baseAcc not found.**\n\n@Tri-Angle`;
				let baseAcc = auction[baseAccID].bidSettings;

				let stats = { username: 'DEFAULT_MIN_BID_AMOUNT', bidAmount: 5 };
				for (let i = 0; i < auction.length; i++) {
					if (i == baseAccID) continue;
					const raw = auction[i];
					if (raw.bidAmount > stats.bidAmount) {
						stats.username = raw.username;
						stats.bidAmount = raw.bidAmount;
					}
				}
				let userAccID = auction.findIndex((e) => e.username == userDb.username);
				let userAcc = auction[userAccID] || { username: 'ZZZ-DU', bidAmount: 0, lastBidTS: Infinity };

				if (!baseAcc._active) return `There is no ongoing auction right now. Check it again in a day or two!`;
				if (Date.now() >= baseAcc.endsAt) return `The auction has **ended**! May the winner be announced somewhere soon in the future...\n\n<small>For some reasons, unfortunately the granting must be done manually by Tri-Angle. Thank you for your patience :<text>)`;

				let yourBidText = 'You have not bid anything yet.';
				if (userAccID != -1) {
					if (stats.username == userDb.username) yourBidText = 'You are in the lead!';
					else yourBidText = `You have bid ${userAcc.bidAmount} coins. It's not enough to win the auction!`;
				}

				return `### Status of current ongoing auction\n${auctionFormatting.cm(baseAcc.bidSubject.subject, baseAcc.bidSubject.amount, stats.bidAmount, stats.username, baseAcc.endsAt)}\n\n${yourBidText}`;
				break;
			default:
				return `Unrecognized subcommand \`${sentence[1]}\`.`;
				break;
		}
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
