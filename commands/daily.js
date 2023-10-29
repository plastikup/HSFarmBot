(function () {
	var cm = async (userDb, devforced) => {
		let lastDaily = userDb.lastDaily;
		if (Date.now() > lastDaily + 82800000 || devforced) {
			const randomGrant = Math.round(Math.random() * 100 + 50);
			userDb.lastDaily = Date.now();
			userDb.coins += randomGrant;

			return([`Granted... &#x1f3b2; &#x1f3b2; **${randomGrant} coins** to your account! Come back in **23 hours** to request another \`@FarmBot daily\`!`, userDb]);
		} else {
			if (lastDaily + 82800000 - Date.now() < 60000) {
				return([`You have recently requested a **daily**. Try again in **${Math.floor((lastDaily + 82800000 - Date.now()) / 1000)} seconds**!`, userDb]);
			} else {
				return([`You have recently requested a **daily**. Try again in **${Math.floor((lastDaily + 82800000 - Date.now()) / (1000 * 60 * 60))} hours and ${Math.floor((lastDaily + 82800000 - Date.now()) / (1000 * 60)) % 60} minutes**!`, userDb]);
			}
		}
	};

	module.exports.cm = async function (userDb, devforced) {
		return await cm(userDb, devforced);
	};
})();
