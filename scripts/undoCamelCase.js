module.exports.cm = function undoCamelCase(word) {
    // code provided by @Awesome_E (@AE_Hopscotch on Github)
	return word.replace(/([a-z])([A-Z])/g, (m0, m1, m2) => m1 + ' ' + m2).replace(/^[a-z]/, (m) => m.toUpperCase());
}
