const cts = {
	VALID_HEAD_COMMAND_REGEXP: /(::mod|takeover|begin|help|view|plant|water|harvest|daily|shop|auction)/i,
	cropTypes: {
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
			blueberrySeeds: 0,
			pinkTulipSeeds: 0,
			strawberrySeeds: 0,
			sunflowerSeeds: 0,
			wheatSeeds: 5,
		},
		cropsInventory: {
			blueberryCrops: 0,
			pinkTulipCrops: 0,
			strawberryCrops: 0,
			sunflowerCrops: 0,
			wheatCrops: 0,
		},
		username: 'ZZZ-DU',
	},
	newFarmDefault: `{"growthLevel":0,"plantedAt":null,"seedType":null,"secret":false,"lastWater":0,"fertilizerCount":0}`,
	test: [['help'], ['view', 'farm'], ['view', 'inventory'], ['view', 'coins'], ['plant', 'wheat', 'spot', '1'], ['water'], ['harvest', 'spot', '1'], ['daily'], ['shop']],
	auctionHelp: `insert auction docs`,
};

module.exports.cts = function () {
	return cts;
};
