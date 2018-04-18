const apiHostname = "https://api.space.itforge.io";
const gqlURL = `${apiHostname}/graphql`;
const loginURL = `${apiHostname}/login`;
const sessionOptions = {
	name: "kmitl_osrs",
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: true
};
const env = process.env.NODE_ENV || "dev";

module.exports = {
	gqlURL: gqlURL,
	apiHostname: apiHostname,
	loginURL: loginURL,
	sessionOptions: sessionOptions,
	env: env
};
