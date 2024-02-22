const sharp = require('sharp');
const cts = require('../constants.js');

let cm = async (userDb, isGarden = false) => {
	// GRID
	let composite = [];
	let farm = isGarden ? userDb.garden : userDb.farm;
	let maxTop = 0;
	let maxLeft = 0;
	for (let i = 0; i < farm.length; i++) {
		const listRaw = farm[i];
		const growthLevelFloored = Math.floor(Math.round(+listRaw.growthLevel * 10000) / 10000);

		if (listRaw.locked === true) continue;

		// item/seed on top of grass
		let input;
		if (growthLevelFloored == -1) input = 'seeddead';
		else if (growthLevelFloored == 0) input = 'base';
		else if (growthLevelFloored == 1) input = 'seed1';
		else if (growthLevelFloored == 2) input = 'seed2';
		else if (growthLevelFloored == 3) input = 'seed3';
		else if (cts.cropTypes._seed_types_regexp.test(listRaw.seedType)) input = listRaw.seedType;
		else if (cts.decoTypes._deco_types_regexp.test(listRaw.seedType)) input = listRaw.seedType;

		// grass type
		let grassType = 'base';
		if (isGarden) {
			if (listRaw.grassType !== 'default' && listRaw.grassType !== undefined) grassType = listRaw.grassType;
			else grassType = 'grass';
		}

		const top = Math.floor(i / (isGarden ? 4 : 3)) * 104;
		const left = (i % (isGarden ? 4 : 3)) * 104;
		maxTop = Math.max(maxTop, top);
		maxLeft = Math.max(maxLeft, left);
		if (input === undefined) composite.push({ input: `./imgs/${grassType}.png`, top: top, left: left });
		else composite.push({ input: `./imgs/${grassType}.png`, top: top, left: left }, { input: `./imgs/${input}.png`, top: top, left: left });

	}
	const newPicture = await sharp({
		create: {
			width: maxLeft + 100,
			height: maxTop + 100,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		},
	})
		.composite(composite)
		.webp({ nearLossless: true })
		.toBuffer();

	// TABLE
	let table = `[details=Table view]\n&ic;|&ic;|&ic;|&ic;\n:-:|:-:|:-:|:-:\n`;

	for (let i = 0; i < Math.sqrt(farm.length); i++) {
		for (let j = 0; j < Math.sqrt(farm.length); j++) {
			const cell = farm[i * (isGarden ? 4 : 3) + j];

			if (cell.locked === true) continue;

			if (cell.seedType == null) table += '[*empty*]|';
			else if (cell.growthLevel == -1) {
				table += `[***dead** ${cell.seedType}*]|`;
			} else {
				if (isGarden) {
					table += `**${cell.seedType}**|`;
				} else {
					let seedInfo = cts.cropTypes[cell.seedType];

					table += `**${cell.seedType}**<br><small>growth level: **${Math.round(((cell.growthLevel - 1) * seedInfo.watersRequired) / 3)}/${seedInfo.watersRequired}**</small>|`;
				}
			}
		}
		table += `\n`;
	}
	table += `[/details]`;

	// encode picture
	const encodedPicture = newPicture
		.toString('base64')
		.replaceAll('A', '%41')
		.replaceAll('E', '%45')
		.replaceAll('I', '%49')
		.replaceAll('O', '%4F')
		.replaceAll('U', '%55')
		.replaceAll('Y', '%59')
		.replaceAll('a', '%61')
		.replaceAll('e', '%65')
		.replaceAll('i', '%69')
		.replaceAll('o', '%6F')
		.replaceAll('u', '%75')
		.replaceAll('y', '%79');

	return `<img src="data:image/png;base64,${encodedPicture}">\n\n${table}`;
};

module.exports.generateFarmImg = async function (userDb, isGarden) {
	return await cm(userDb, isGarden);
};
