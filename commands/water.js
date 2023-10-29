(async function () {
	const generateFarmImg = require('../script/generateFarmImg.js');
	const cropTypes = require('../constants.js').cts().cropTypes;

	let cm = async (userDb, devforced) => {
		let nextWaterTS = userDb.lastWater + 28800000;
		if (Date.now() > nextWaterTS || devforced) {
			let somethingToWater = false;
			for (let i = 0; i < userDb.farm.length; i++) {
				userDb.farm[i].lastWater = Date.now();
				const seedType = userDb.farm[i].seedType;
				if (seedType != null && userDb.farm[i].growthLevel != -1) {
					let increment = 3 / cropTypes[seedType].watersRequired;
					userDb.farm[i].growthLevel += increment;
					somethingToWater = true;
				}
			}

			if (!somethingToWater) {
				return [`No crops to water!\n\n${await generateFarmImg.generateFarmImg(userDb)}`, userDb];
			} else {
				userDb.lastWater = Date.now();
				return [`@${userDb.username}, you have watered your thirsty plants!\n\n${await generateFarmImg.generateFarmImg(userDb)}\n\nMake sure to water them again **in 8 hours!**`, userDb];
			}
		} else {
			if (nextWaterTS - Date.now() < 60000) {
				return [`Your plants are not thirsty. Try again in **${Math.floor((nextWaterTS - Date.now()) / 1000)} seconds**!`, userDb];
			} else {
				return [`Your plants are not thirsty. Try again in **${Math.floor((nextWaterTS - Date.now()) / (1000 * 60 * 60))} hour(s) and ${Math.floor((nextWaterTS - Date.now()) / (1000 * 60)) % 60} minute(s)**!`, userDb];
			}
		}
	};

	module.exports.cm = async function (userDb, devforced) {
		return await cm(userDb, devforced);
	};
})();
