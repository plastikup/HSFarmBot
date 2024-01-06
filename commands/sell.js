const undoCamelCase = require('../scripts/undoCamelCase.js');
const cropTypes = require('../constants.js').cropTypes;

let cm = async (sentence, userDb) => {
	let tgcrop, nbToSell;
	if (sentence.length == 2) {
		tgcrop = sentence[1].toLowerCase().substring(0, sentence[1].search(/(crops?|seeds?|)$/i));
		nbToSell = Math.max(Math.min(userDb.cropsInventory[tgcrop + 'crops'], 1), 0);
	} else {
		tgcrop = sentence[2].toLowerCase().substring(0, sentence[2].search(/(crops?|seeds?|)$/i));

		if (Math.round(Number(sentence[1])) <= 0 && sentence[1] !== 'all' && !isNaN(Math.round(Number(sentence[1])))) return [`Please enter a digit bigger than 1, or the command 'all'. You entered: \`${sentence[1]}\`.`, userDb];

		if (sentence[1] === 'all') nbToSell = Math.min(userDb.cropsInventory[tgcrop + 'crops'], 1000);
		else nbToSell = Math.min(userDb.cropsInventory[tgcrop + 'crops'], Math.round(Number(sentence[1])));
	}

	if (!cropTypes._seed_types_regexp.test(tgcrop)) return [`Unknown type of crop. Remember, do not put spaces in between crop names (if that applies) :))`, userDb];
	else if (+nbToSell <= 0) return [`You do not own any ${tgcrop} crop. Reply with \`@FarmBot view inventory\` to display your items!`, userDb];

	userDb.cropsInventory[tgcrop + 'crops'] -= nbToSell;
	const earnings = nbToSell * cropTypes[tgcrop].earnings;
	userDb.coins += earnings;

	return [`You sold **${nbToSell} ${tgcrop} crop${nbToSell == 1 ? '' : 's'}** to MooseFarms Co., and earned **${earnings} coins**!`, userDb];
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
