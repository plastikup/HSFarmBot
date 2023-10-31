//const cropTypes = require('../constants.js').cts().cropTypes;
const auctionHelp = require('../constants.js').cts().auctionHelp;


let cm = async (sentence, userDb) => {
	if (sentence[1] == undefined) return [`Valid subcommands for \`@FarmBot auction\`:\n- \`help\`: What's an auction, what's a bid? Everything you need to know before getting started;\n- \`info\`: view the current ongoing auction happening;\n- \`bid [amount]\`: bid an amount of coins on the ongoing auction.`, userDb];
	else {
		switch (sentence[1].toLowerCase()) {
			case 'help':
				return [auctionHelp, userDb];
				break;
			case 'info':
				return [`### Status of current ongoing auction:\n[comming soon]`, userDb];
				break;
			case 'bid':
				return [`[bidding coming soon]`, userDb];
				break;

			default:
				return [`Unrecognized subcommand \`${sentence[1]}\`.`, userDb];
				break;
		}
    }
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
