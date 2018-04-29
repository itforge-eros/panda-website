const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const apiHostname =
	process.env.NODE_ENV == "production"
		? "http://127.0.0.1:9000"
		: "https://api.space.itforge.io";
const gqlURL = `${apiHostname}/graphql`;
const loginURL = `${apiHostname}/login`;
const sessionOptions = {
	name: "kmitl_osrs",
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: true,
	store: new MemoryStore({
		checkPeriod: 86400000
	})
};
const env = process.env.NODE_ENV || "dev";

module.exports = {
	gqlURL: gqlURL,
	apiHostname: apiHostname,
	loginURL: loginURL,
	sessionOptions: sessionOptions,
	env: env
};
