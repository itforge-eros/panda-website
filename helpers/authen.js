const hasAllAccess = (my, required) => {
	let flag = false;
	for(var i = 0; i < required.length; i++)
		if (!my.includes(required[i])) {flag = true; break}
	return !flag
};

const hasEitherAccess = (my, required) => {
	let pass = false;
	for(var i = 0; i < required.length; i++)
		if (my.includes(required[i])) {pass = true; break}
	return !pass
};

module.exports = {
	hasAccess: hasAccess,
	hasEitherAccess: hasEitherAccess
}
