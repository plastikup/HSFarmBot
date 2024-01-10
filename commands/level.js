module.exports = async (userDb) => {
	const userLevel = Math.floor(0.25 * Math.sqrt(+userDb.experiences + 1));
	const requiredPointsForNextLevel = Math.round(16 * (userLevel + 1) ** 2) - +userDb.experiences;
	return `You are at **level ${userLevel}** with ${userDb.experiences} experience-points - you're **missing ${requiredPointsForNextLevel} points to reach level ${userLevel + 1}**!`;
};
