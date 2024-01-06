module.exports = async (userDb) => {
	const userLevel = Math.floor(Math.sqrt(+userDb.experiences + 1));
	const requiredPointsForNextLevel = Math.round((userLevel + 1) ** 2 - 1) - +userDb.experiences;
	return `You are at **level ${userLevel}** with ${userDb.experiences} experience-points - you're **missing ${requiredPointsForNextLevel} points to reach level ${userLevel + 1}**!`;
};
