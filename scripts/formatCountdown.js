let cm = (endTS) => {
	if (endTS - Date.now() < 60000) return `${Math.floor((endTS - Date.now()) / 1000)} seconds`;
	else return `${Math.floor((endTS - Date.now()) / (1000 * 60 * 60))} hours and ${Math.floor((endTS - Date.now()) / (1000 * 60)) % 60} minutes`;
};

module.exports.cm = function (endTS) {
	return cm(endTS);
};
