const undoCamelCase = require('../scripts/undoCamelCase.js');
const formatCountdown = require('../scripts/formatCountdown.js');

module.exports.cm = function (subject, bidAmount, username, endsAt) {
	return `> \uD83D\uDD0D **Bidding subject**: ${undoCamelCase.cm(subject)}\n> \uD83D\uDCB0 **Highest bid so far**: ${bidAmount} coins ${username != 'DEFAULT_MIN_BID_AMOUNT' ? `(by ${username})` : ''}\n> \u23F3 **Ends in**: ${formatCountdown.cm(endsAt)}`;
};
