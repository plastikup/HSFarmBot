let cm = async (sentence, userDb) => {
	if (sentence[1] == undefined) return [`Valid **sub**commands for \`@FarmBot shop\`:\n- \`list\`: display your shopping list (what you can buy at MooseFarms Co.);\n- \`buy [item]\`: buy an item from your shopping list.`, userDb];
	else
		switch (sentence[1].toLowerCase()) {
			case 'list':
				return [`shopping list in progress.`, userDb];
				break;
			case 'buy':
				return [`buying items in progress`, userDb];
				break;
			case 'coins':
				return [`You have **${userDb.coins} coins**.`, userDb];
				break;
			default:
				return [`Unrecognized subcommand \`${sentence[1]}\`.`, userDb];
				break;
		}
};

module.exports.cm = async function (sentence, userDb) {
	return await cm(sentence, userDb);
};
