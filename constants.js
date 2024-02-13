module.exports = {
	VALID_HEAD_COMMAND_REGEXP: /(::mod|::beta|takeover|begin|help|view|plant|water|harvest|daily|buy|sell|bid)/i,
	cropTypes: {
		_seed_types_regexp: /^(wheat|strawberry|poppy|blueberry|purpleTulip|sunflower|goldenSunflower|pinkTulip|goldenWheat|lilyValley|snowdrops|witchhazel|winterberry|camellias|paradisebird|lavender)$/i,
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
			earnings: 60,
		},
		blueberry: {
			watersRequired: 4,
			earnings: 90,
		},
		purpletulip: {
			watersRequired: 4,
			earnings: 65,
		},
		sunflower: {
			watersRequired: 5,
			earnings: 90,
		},
		goldensunflower: {
			watersRequired: 6,
			earnings: 120,
		},
		pinktulip: {
			watersRequired: 6,
			earnings: 100,
		},
		goldenwheat: {
			watersRequired: 8,
			earnings: 150,
		},
		lilyvalley: {
			watersRequired: 12,
			earnings: 90,
		},
		snowdrops: {
			watersRequired: 4,
			earnings: 140,
		},
		witchhazel: {
			watersRequired: 5,
			earnings: 150,
		},
		winterberry: {
			watersRequired: 6,
			earnings: 175,
		},
		camellias: {
			watersRequired: 10,
			earnings: 225,
		},
		paradisebird: {
			watersRequired: 10,
			earnings: 200,
		},
		lavender: {
			watersRequired: 6,
			earnings: 355,
		}
	},
	decoTypes: {
		_deco_types_regexp: /^(stonemoosestatue|coppermoosestatue|silvermoosestatue|fountaindecor|lilyponddecor|minibarndecor|ponddecor)$/i,
	},
	NEW_USER_JSON: {
		farm: [
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
			{
				fertilizerCount: 0,
				growthLevel: 0,
				lastWater: 0,
				plantedAt: null,
				secret: false,
				seedType: null,
			},
		],
		lastWater: 0,
		coins: 0,
		lastDaily: 0,
		seedsInventory: {
			wheatseeds: 5,
			strawberryseeds: 0,
			poppyseeds: 0,
			blueberryseeds: 0,
			purpletulipseeds: 0,
			sunflowerseeds: 0,
			goldensunflowerseeds: 0,
			pinktulipseeds: 0,
			goldenwheatseeds: 0,
			lilyvalleyseeds: 0,
		},
		cropsInventory: {
			wheatcrops: 0,
			strawberrycrops: 0,
			poppycrops: 0,
			blueberrycrops: 0,
			purpletulipcrops: 0,
			sunflowercrops: 0,
			goldensunflowercrops: 0,
			pinktulipcrops: 0,
			goldenwheatcrops: 0,
			lilyvalleycrops: 0,
		},
		level: 0,
		username: 'ZZZ-DU',
		experiences: 0,
		dbVersion: 'v2024.1',
	},
	newFarmDefault: `{"growthLevel":0,"plantedAt":null,"seedType":null,"secret":false,"lastWater":0,"fertilizerCount":0}`,
	rewardsList: {
		'1': [
			{
				category: 'moosefarmpacks',
				name: 'farmpack',
				quantity: 2,
			},
			{
				category: 'moosefarmpacks',
				name: 'flowerpack',
				quantity: 1,
			},
			{
				category: 'coins',
				name: 'coins',
				quantity: 65,
			},
		],
		'2': [
			{
				category: 'miscellaneous',
				name: 'basicfertilizer',
				quantity: 3,
			},
			{
				category: 'moosefarmpacks',
				name: 'farmpack',
				quantity: 2,
			},
			{
				category: 'coins',
				name: 'coins',
				quantity: 100,
			},
		],
		'3': [
			{
				category: 'message',
				message: 'YOU HAVE UNLOCKED... THE ***GARDEN***! (coming very soon)',
			},
			{
				category: 'miscellaneous',
				name: 'stonemoosestatue',
				quantity: 1,
			},
			{
				category: 'coins',
				name: 'coins',
				quantity: 100,
			},
		],
		'4': [
			{
				category: 'moosefarmpacks',
				name: 'farmpack',
				quantity: 2,
			},
			{
				category: 'coins',
				name: 'coins',
				quantity: 200,
			},
		],
		'5': [
			{
				category: 'miscellaneous',
				name: 'coppermoosestatue',
				quantity: 1,
			},
			{
				category: 'coins',
				name: 'coins',
				quantity: 250,
			},
		],
		'6': [
			{
				category: 'decorpacks',
				name: 'basicdecorpack',
				quantity: 2,
			},
			{
				category: 'coins',
				name: 'coins',
				quantity: 275,
			},
		],
		'7': [
			{
				category: 'miscellaneous',
				name: 'silvermoosestatue',
				quantity: 1,
			},
			{
				category: 'coins',
				name: 'coins',
				quantity: 300,
			},
		],
	},
	botVersion: 'v2024.3beta2',
};
