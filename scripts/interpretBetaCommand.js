const cml = {
	help: () => {
		return require('../commands/help.js').cm();
	},
};

module.exports = async (commandList, userDb, devforced = false) => {
	// interpret commands
	let arrayedAnswers = [];
	for (let i = 0; i < commandList.length; i++) {
		const sentence = commandList[i].slice(1);
		arrayedAnswers[i] = await interpret(sentence);
	}

	async function interpret(sentence) {
		let answer = null;
		if (sentence.length == 0) {
            return 'Currently no `::beta` command to test.'
		} else {
			switch (sentence[0].toLowerCase()) {

				default:
					answer = `Unrecognized beta **sub**command \`${sentence[0]}\`.`;
					break;
			}
			return answer;
		}
	}

	return [arrayedAnswers.join('\n___\n'), userDb];
};
