const hasAllAccess = (my, required) => {
	let flag = false;
	for(var i = 0; i < required.length; i++)
		if (!my.includes(required[i])) {flag = true; break}
	return !flag
};

const hasEitherAccess = (my, required) => required.some(r => my.includes(r));

module.exports = {
	hasAllAccess: hasAllAccess,
	hasEitherAccess: hasEitherAccess
}
