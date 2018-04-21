const hasAccess = (my, required) => {
	let flag = false;
	for(var i = 0; i < required.length; i++)
		if (!my.includes(required[i])) {flag = true; break}
	return !flag
};

module.exports = {
	hasAccess: hasAccess
}
