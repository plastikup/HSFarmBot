(function () {
	const sharp = require('sharp');
    const cropTypes = {
        _seed_types_regexp: /^(wheat|strawberry|poppy|blueberry|purpleTulip|sunflower|goldenSunflower|pinkTulip|goldenWheat|lilyValley)$/i,
        wheat: {
            watersRequired: 3,
            earnings: 35,
        },
        strawberry: {
            watersRequired: 4,
            earnings: 40,
        },
        poppy: {
            watersRequired: 3,
            earnings: 40,
        },
        blueberry: {
            watersRequired: 4,
            earnings: 50,
        },
        purpleTulip: {
            watersRequired: 4,
            earnings: 50,
        },
        sunflower: {
            watersRequired: 5,
            earnings: 70,
        },
        goldenSunflower: {
            watersRequired: 5,
            earnings: 90,
        },
        pinkTulip: {
            watersRequired: 6,
            earnings: 100,
        },
        goldenWheat: {
            watersRequired: 8,
            earnings: 120,
        },
        lilyValley: {
            watersRequired: 12,
            earnings: 90,
        },
    };

	var cm = async (userDb) => {
        // GRID
		let grid = [];
		for (let i = 0; i < 9; i++) {
			const listRaw = userDb.farm[i];
			const growthLevelFloored = Math.floor(listRaw.growthLevel);
			if (growthLevelFloored == -1) grid.push('seeddead');
			else if (growthLevelFloored == 0) grid.push('base');
			else if (growthLevelFloored == 1) grid.push('seed1');
			else if (growthLevelFloored == 2) grid.push('seed2');
			else if (growthLevelFloored == 3) grid.push('seed3');
			else if (plantTypesRegex.test(listRaw.seedType)) grid.push(listRaw.seedType);
			else grid.push('base');
		}
		const newPicture = await sharp({
			create: {
				width: 308,
				height: 308,
				channels: 4,
				background: { r: 0, g: 0, b: 0 },
			},
		})
			.composite([
				{ input: `./imgs/${grid[0]}.png`, gravity: 'northwest' },
				{ input: `./imgs/${grid[1]}.png`, gravity: 'north' },
				{ input: `./imgs/${grid[2]}.png`, gravity: 'northeast' },
				{ input: `./imgs/${grid[3]}.png`, gravity: 'west' },
				{ input: `./imgs/${grid[4]}.png`, gravity: 'centre' },
				{ input: `./imgs/${grid[5]}.png`, gravity: 'east' },
				{ input: `./imgs/${grid[6]}.png`, gravity: 'southwest' },
				{ input: `./imgs/${grid[7]}.png`, gravity: 'south' },
				{ input: `./imgs/${grid[8]}.png`, gravity: 'southeast' },
			])
			.png()
			.toBuffer();

        // TABLE

		let table = `[details=Table view]\n&ic;|&ic;|&ic;\n:-:|:-:|:-:\n`;

		for (let i = 0; i < 3; i++) {
			const row = [userDb.farm[i * 3], userDb.farm[i * 3 + 1], userDb.farm[i * 3 + 2]];
			for (let j = 0; j < row.length; j++) {
				const cell = row[j];
				if (cell.seedType == null) table += '[*empty*]|';
				else if (cell.growthLevel == -1) {
					table += `[***dead** ${cell.seedType}*]|`;
				} else {
					let seedInfo = cropTypes[cell.seedType];
					table += `**${cell.seedType}**<br><small>growth level: **${(cell.growthLevel * seedInfo.watersRequired) / 3}/${seedInfo.watersRequired}**</small>|`;
				}
			}
			table += `\n`;
		}
		table += `[/details]`;

		return `<img src="data:image/png;base64,${newPicture.toString('base64')}">\n\n${table}`;
	};

	module.exports.generateFarmImg = async function (userDb) {
		return await cm(userDb);
	};
})();

/*
async function generateFarmImg(userDb) {
	let grid = [];
	for (let i = 0; i < 9; i++) {
		const listRaw = userDb.farm[i];
		const growthLevelFloored = Math.floor(listRaw.growthLevel);
		if (growthLevelFloored == -1) grid.push('seeddead');
		else if (growthLevelFloored == 0) grid.push('base');
		else if (growthLevelFloored == 1) grid.push('seed1');
		else if (growthLevelFloored == 2) grid.push('seed2');
		else if (growthLevelFloored == 3) grid.push('seed3');
		else if (plantTypesRegex.test(listRaw.seedType)) grid.push(listRaw.seedType);
		else grid.push('base');
	}
	const newPicture = await sharp({
		create: {
			width: 308,
			height: 308,
			channels: 4,
			background: { r: 0, g: 0, b: 0 },
		},
	})
		.composite([
			{ input: `./imgs/${grid[0]}.png`, gravity: 'northwest' },
			{ input: `./imgs/${grid[1]}.png`, gravity: 'north' },
			{ input: `./imgs/${grid[2]}.png`, gravity: 'northeast' },
			{ input: `./imgs/${grid[3]}.png`, gravity: 'west' },
			{ input: `./imgs/${grid[4]}.png`, gravity: 'centre' },
			{ input: `./imgs/${grid[5]}.png`, gravity: 'east' },
			{ input: `./imgs/${grid[6]}.png`, gravity: 'southwest' },
			{ input: `./imgs/${grid[7]}.png`, gravity: 'south' },
			{ input: `./imgs/${grid[8]}.png`, gravity: 'southeast' },
		])
		.png()
		.toBuffer();

	return `<img src="data:image/png;base64,${newPicture.toString('base64')}">\n\n${generateFarmTable(userDb)}`;
}

function generateFarmTable(userDb) {
	let returned = `[details=Table view]\n&ic;|&ic;|&ic;\n:-:|:-:|:-:\n`;

	for (let i = 0; i < 3; i++) {
		const row = [userDb.farm[i * 3], userDb.farm[i * 3 + 1], userDb.farm[i * 3 + 2]];
		for (let j = 0; j < row.length; j++) {
			const cell = row[j];
			if (cell.seedType == null) returned += '[*empty*]|';
			else if (cell.growthLevel == -1) {
				returned += `[***dead** ${cell.seedType}*]|`;
			} else {
				let seedInfo = cropTypes[cell.seedType];
				returned += `**${cell.seedType}**<br><small>growth level: **${(cell.growthLevel * seedInfo.watersRequired) / 3}/${seedInfo.watersRequired}**</small>|`;
			}
		}
		returned += `\n`;
	}
	returned += `[/details]`;
	return returned;
}
*/
