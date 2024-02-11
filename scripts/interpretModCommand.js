const dbFus = require('../dyna/dbFus.js');
const dbAu = require('../dyna/dbAu.js');
const cts = require('../constants.js');
const auctionFormatting = require('../scripts/auctionFormatting.js');
const callAllFarmers = require('../scripts/callAllFarmers.js');
const generateFarmImg = require('../scripts/generateFarmImg.js');

module.exports = async (sentence, userDb, db, cooked) => {
	switch (sentence[1].toLowerCase()) {
		case 'version':
			return `The active version of the bot is currently **${cts.botVersion}**.`;
		case 'allfarmers':
			return `\n\n\`${await callAllFarmers(db)}\``;
		case 'viewRaw':
			return `\n\n\`\`\`\n${cooked}\n\`\`\``;
		case 'startauction':
			await dbAu.put(process.env.baseID, {
				bidSettings: {
					_active: true,
					endsAt: Date.now() + Number(sentence[4]) * 86400000,
					bidSubject: {
						subject: sentence[3],
						amount: Number(sentence[2]),
					},
				},
			});
			await dbAu.delete('*?q={"isBase": false}');
			return `\n# A NEW AUCTION HAS SPAWNED\n\n${auctionFormatting.cm(sentence[3], Number(sentence[2]), 5, 'DEFAULT_MIN_BID_AMOUNT', Date.now() + Number(sentence[4]) * 86400000)}`;
		case 'changegrass': {
			//* copy pasted code from garden.js
			let spot = 0;
			for (let i = 0, j = 0; i < userDb.garden.length; i++) {
				if (userDb.garden[i].locked === false) {
					j++;
				}
				if (j <= +sentence[4] - 1) {
					spot++;
				}
			}
			userDb.garden[spot].grassType = sentence[2];
			await dbFus.put(userDb._id, userDb);

			return `Changed grass to ${sentence[2]} on spot ${sentence[4]}! Here's how your garden looks like right now:\n\n${await generateFarmImg.generateFarmImg(userDb, true)}`;
		}

		default:
			return `Unrecognized mod command \`${sentence[1]}\`.\n\nValid **sub**commands for \`@FarmBot ::mod\`:\n- \`version\`: get the version of the bot;\n- \`allfarmers\`: get a list of every farmers;\n- \`viewRaw\`: post the HTML raw version of the post; \n- \`startauction [amount] [seed/crop/deco] [ending timestamp]\`: start a new auction!\n- \`changegrass [grassname] spot [number]\`: change the grass of your garden! Grass options: \`blossomGrass, galaxyGrass, grass, martianGrass, technoGrass, valentineGrass, volcanoGrass\``;
	}
};
