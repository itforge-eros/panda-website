const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const testData = require("../models/testData");

const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const fetch = require("node-fetch");
const gql = require("graphql-tag");

const apollo = new ApolloClient({
	link: createHttpLink({ uri: globalVars.gqlURL, fetch: fetch }),
	cache: new InMemoryCache()
});

const getMember = (usr, pwd) => {
	return apollo.query({
		query: gql`
			{
				login(username: "${usr}", password: "${pwd}") {
					member {
						id, username, firstName, lastName, email
					},
					token
				}
			}
		`
	});
};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(
	session({
		name: "kmitl_osrs",
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true
	})
);

let isCredEmpty = false;

// GET authentication methods
router.get("/", (req, res, next) => {
	res.redirect("/");
});

router.get("/login", (req, res, next) => {
	res.render("login", { session: testData.session, user: testData.user, member: req.session.member, isCredEmpty: isCredEmpty });
	isCredEmpty = false; // reset so that refreshing the page doesn't display error
});

router.post("/login", multer().array(), (req, res, next) => {
	if (req.body.username == "" || req.body.password == "") {
		isCredEmpty = true;
		res.redirect("/authen/login");
	} else {
		getMember(req.body.username, req.body.password).then(data => {
			req.session.token = data.data.login.token;
			req.session.member = data.data.login.member;
			res.redirect("/");
		});
	}
});

router.get("/logout", (req, res) => {
	req.session.token = null;
	req.session.member = null;
	res.redirect("/");
});

module.exports = router;
