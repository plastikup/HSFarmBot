module.exports = async function (sentence, userDb) {
	if (sentence[1] == undefined) return [`Valid **sub**commands for \`@FarmBot garden\`:\n- \`plant [cropname] spot [number]\`: plant a crop from your inventory;\n- \`remove spot [number]\`: remove a crop from your garden, to place it safely in your inventory;`, userDb];

	let answer = 'yolo im coming soon';
	return [answer, userDb];
};
