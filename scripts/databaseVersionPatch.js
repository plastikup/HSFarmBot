module.exports = async (userDb) => {
	if (userDb.dbVersion === 'v2024.0') {
		let newSeedsInventory = {
			'wheatseeds': 0,
			'strawberryseeds': 0,
			'poppyseeds': 0,
			'blueberryseeds': 0,
			'purpletulipseeds': 0,
			'sunflowerseeds': 0,
			'goldensunflowerseeds': 0,
			'pinktulipseeds': 0,
			'goldenwheatseeds': 0,
			'lilyvalleyseeds': 0,
			'snowdropsseeds': 0,
			'witchhazelseeds': 0,
			'winterberryseeds': 0,
			'camelliasseeds': 0,
			'paradisebirdseeds': 0,
		};
		let newCropsInventory = {
			'wheatcrops': 0,
			'strawberrycrops': 0,
			'poppycrops': 0,
			'blueberrycrops': 0,
			'purpletulipcrops': 0,
			'sunflowercrops': 0,
			'goldensunflowercrops': 0,
			'pinktulipcrops': 0,
			'goldenwheatcrops': 0,
			'lilyvalleycrops': 0,
			'snowdropscrops': 0,
			'witchhazelcrops': 0,
			'winterberrycrops': 0,
			'camelliascrops': 0,
			'paradisebirdcrops': 0,
		};

		for (const [key, value] of Object.entries(userDb.seedsInventory)) {
			newSeedsInventory[key] = value;
		}
		for (const [key, value] of Object.entries(userDb.cropsInventory)) {
			newCropsInventory[key] = value;
		}

		userDb.seedsInventory = newSeedsInventory;
		userDb.cropsInventory = newCropsInventory;
		userDb.dbVersion = 'v2024.1';
	}

	if (userDb.dbVersion === 'v2024.1') {
		let newMiscellaneousInventory = {
			'basicfertilizer': 0,
			'stonemoosestatue': 0,
			'coppermoosestatue': 0,
			'silvermoosestatue': 0,
		};

		userDb.miscellaneousInventory = newMiscellaneousInventory;

		userDb.dbVersion = 'v2024.2';
	}

	if (userDb.dbVersion === 'v2024.2' || userDb.dbVersion === 'v2024.3beta') {
		userDb.garden = [
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': true,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': true,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': false,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': true,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': true,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': true,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': true,
			},
			{
				'plantedAt': null,
				'seedType': null,
				'grassType': 'default',
				'locked': true,
			},
		];

		userDb.miscellaneousInventory.fountaindecor = 0;
		userDb.miscellaneousInventory.lilyponddecor = 0;
		userDb.miscellaneousInventory.minibarndecor = 0;
		userDb.miscellaneousInventory.ponddecor = 0;

		userDb.seedsInventory.lavenderseeds = 0;
		userDb.cropsInventory.lavendercrops = 0;

		userDb.dbVersion = 'v2024.3beta2';
	}

	if (userDb.dbVersion === 'v2024.3beta2') {
		userDb.seedsInventory.undefinedseeds = +(userDb.seedsInventory.undefinedseeds === null);
		userDb.cropsInventory.undefinedcrops = 0;

		userDb.dbVersion = 'v2024.3';
	}

	return userDb;
};
