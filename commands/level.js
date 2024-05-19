const calcUserLevel = (input) => Math.min(Math.floor(0.25 * Math.sqrt(+input + 1)), 10);

module.exports.calcUserLevel = calcUserLevel;

module.exports.cm = async (userDb) => {
	const userLevel = calcUserLevel(+userDb.experiences + 1);
	const requiredPointsForNextLevel = Math.round(16 * (userLevel + 1) ** 2) - +userDb.experiences;
	if (userLevel === 10) {
		return `You are maxed out at level 10 with ${userDb.experiences} experience-points!`;
	} else {
		return `You are at **level ${userLevel}** with ${userDb.experiences} experience-points - you're **missing ${requiredPointsForNextLevel} points to reach level ${userLevel + 1}**!`;
	}
};
