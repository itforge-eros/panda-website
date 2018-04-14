const gqlURL = "http://api.panda.itforge.io/graphql";
const loginURL = "http://api.panda.itforge.io/login";
const sessionOptions = {
	name: "kmitl_osrs",
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: true
};
const env = process.env.NODE_ENV || "dev";

module.exports = {
	gqlURL: gqlURL,
	loginURL: loginURL,
	sessionOptions: sessionOptions,
	env: env
};
