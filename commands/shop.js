const dbMs = require('../dyna/dbMs.js').dbMs();

let cm = async (sentence, userDb) => {
	let mooseFarms = await dbMs.get();
	if (sentence[1] == undefined) {
		return [`Valid **sub**commands for \`@FarmBot shop\`:\n- \`list\`: display your shopping list (what you can buy at MooseFarms Co.);\n- \`buy [item]\`: buy an item from your shopping list.`, userDb];
	} else {
		switch (sentence[1].toLowerCase()) {
			case 'list':
				let table = `Pack name|Content & luck|Price\n-|-|-\n`;
				for (const item of mooseFarms) {
                    console.log(item);
					table += `${item.packName}|`;

                    for (const seed of item.packContent) {
                        table += `${seed.seedName.replace(/([a-z])([A-Z])/g, (m0, m1, m2) => m1 + ' ' + m2).replace(/^[a-z]/, (m) => m.toUpperCase())}: **${seed.luck}%**<br>`;
                    }
                    table += `|${item.packPrice}\n`;
				}
				return [`### MooseFarms Co.'s products\n\n${table}`, userDb];
				break;
			case 'buy':
				return [`buying items in progress`, userDb];
				break;
			case 'coins':
				return [`You have **${userDb.coins} coins**.`, userDb];
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
