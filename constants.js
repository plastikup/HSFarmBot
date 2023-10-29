(function () {
	const cts = {
		VALID_HEAD_COMMAND_REGEXP: /(::mod|takeover|begin|help|view|plant|water|harvest|coins|daily)/i,
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
	};

	module.exports.cts = function () {
		return cts;
	};
})();
