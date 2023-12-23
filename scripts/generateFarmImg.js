const sharp = require('sharp');
const cropTypes = require('../constants.js').cropTypes;

let cm = async (userDb) => {
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
		else if (cropTypes._seed_types_regexp.test(listRaw.seedType)) grid.push(listRaw.seedType);
		else grid.push('base');
	}
	const snowMask = [
		await sharp('./imgs/snowMask.png').rotate(0).toBuffer(),
		await sharp('./imgs/snowMask.png').rotate(90).toBuffer(),
		await sharp('./imgs/snowMask.png').rotate(180).toBuffer(),
		await sharp('./imgs/snowMask.png').rotate(270).toBuffer(),
	];
	const newPicture = await sharp({
		create: {
			width: 308,
			height: 308,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		},
	})
		.composite([
			{ input: `./imgs/${grid[0]}.png`, gravity: 'northwest' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'northwest' },
			{ input: `./imgs/${grid[1]}.png`, gravity: 'north' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'north' },
			{ input: `./imgs/${grid[2]}.png`, gravity: 'northeast' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'northeast' },
			{ input: `./imgs/${grid[3]}.png`, gravity: 'west' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'west' },
			{ input: `./imgs/${grid[4]}.png`, gravity: 'centre' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'centre' },
			{ input: `./imgs/${grid[5]}.png`, gravity: 'east' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'east' },
			{ input: `./imgs/${grid[6]}.png`, gravity: 'southwest' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'southwest' },
			{ input: `./imgs/${grid[7]}.png`, gravity: 'south' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'south' },
			{ input: `./imgs/${grid[8]}.png`, gravity: 'southeast' },
			{ input: snowMask[Math.floor(Math.random() * 4)], gravity: 'southeast' },
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
				table += `**${cell.seedType}**<br><small>growth level: **${Math.round(((cell.growthLevel - 1) * seedInfo.watersRequired) / 3)}/${seedInfo.watersRequired}**</small>|`;
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
