const gqlHostname = "api.space.itforge.io"
const gqlURL = `https://${gqlHostname}/graphql`;
const loginURL = `https://${gqlHostname}/login`;
const sessionOptions = {
	name: "kmitl_osrs",
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: true
};
const env = process.env.NODE_ENV || "dev";

module.exports = {
	gqlURL: gqlURL,
	gqlHostname: gqlHostname,
	loginURL: loginURL,
	sessionOptions: sessionOptions,
	env: env
};
