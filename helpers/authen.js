const hasAllAccess = (my, required) => required.every(r => my.includes(r));
const hasEitherAccess = (my, required) => required.some(r => my.includes(r));

module.exports = {
	hasAllAccess: hasAllAccess,
	hasEitherAccess: hasEitherAccess
}
