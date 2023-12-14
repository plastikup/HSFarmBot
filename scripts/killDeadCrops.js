const generateFarmImg = require('../scripts/generateFarmImg.js');
const cropTypes = require('../constants.js').cropTypes;

module.exports = async (userDb) => {
	for (let i = 0; i < 9; i++) {
		if (userDb.farm[i].seedType != null && Date.now() > userDb.farm[i].lastWater + 216000000) {
			userDb.farm[i].growthLevel = -1;
		}
	}
	return userDb;
};
