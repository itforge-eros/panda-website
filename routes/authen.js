const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const ghp = require("../helpers/gql");
const qs = require("querystring");

// required for apollo
const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const fetch = require("node-fetch");
const gql = require("graphql-tag");

// token for apollo
let token = "";

router.use((req, res, next) => {token = req.session.token; next()});
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const apollo = new ApolloClient({
	link: createHttpLink({ uri: globalVars.gqlURL, fetch: fetch }),
	cache: new InMemoryCache()
});

const authLink = setContext((_, { headers }) => {
	return { headers: { authorization: token ? `bearer${token}` : "" } };
});

const apollo_auth = new ApolloClient({
	link: authLink.concat(
		createHttpLink({ uri: globalVars.gqlURL, fetch: fetch })
	),
	cache: new InMemoryCache(),
	defaultOptions: {query: {fetchPolicy: "no-cache"}}
});

let isCredEmpty = false;
let isCredInvalid = false;

router.get("/", (req, res, next) => {
	res.redirect("/");
});

router.get("/login", (req, res, next) => {
	res.render("login", {
		member: req.session.member,
		isCredEmpty: isCredEmpty,
		isCredInvalid: isCredInvalid,
		currentDept: req.session.currentDept,
		queryString: req.query
	});
	// reset the flags so that the page hides the errors on refresh
	isCredEmpty = false;
	isCredInvalid = false;
});

router.post("/login", multer().array(), (req, res, next) => {
	if (req.body.username == "" || req.body.password == "") {
		isCredEmpty = true;
		res.redirect("/authen/login/");
	} else {
		// send login request
		ghp.sendLogin(apollo, req.body.username, req.body.password)
			.then(data => {
				req.session.token = data.data.login.token;
				req.session.member = data.data.login.member;
				token = req.session.token;

				// get current user's info
				ghp.getMe(apollo_auth).then(meData => {
					req.session.member = {...req.session.member, ...meData.data.me};

					// check how many departments the user is in
					if (req.session.member.roles.length > 1) {

						// user is in > 1 dept, set default to the first one
						req.session.currentDept = req.session.member.roles[0].department;

						// get accesses for the current department
						ghp.getAccesses(apollo_auth, req.session.currentDept.name)
							.then(accesses => {
								// set accesses of the current role
								req.session.member.currentAccesses = accesses.data.me.accesses;
								if (req.query.redirect == "true")
									res.redirect("/space/" + req.query.dept + "/" + req.query.space + "/");
								else
									res.redirect("/choose-dept/");
							})
							.catch(err => {
								if (globalVars.env != "production") console.log(err);
								res.redirect("/error/");
							});

					} else if (req.session.member.roles.length == 1) {
						req.session.currentDept = req.session.member.roles[0].department;
						ghp.getAccesses(apollo_auth, req.session.currentDept.name)
							.then(accesses => {
								req.session.member.currentAccesses = accesses.data.me.accesses;
								if (req.query.redirect == "true")
									res.redirect("/space/" + req.query.dept + "/" + req.query.space + "/");
								else
									res.redirect("/");
							})
							.catch(err => {
								if (globalVars.env != "production") console.log(err);
								res.redirect("/error/");
							});

					} else {
						req.session.currentDept = {};
						req.session.member.currentAccesses = ["SPACE_READ_ACCESS"]; // set access for no-role user
						if (req.query.redirect == "true")
							res.redirect("/space/" + req.query.dept + "/" + req.query.space + "/");
						else
							res.redirect("/");
					}
				}).catch(err => {
					// catch getMe() error
					if (globalVars.env != "production") console.log(err);
					res.redirect("/error")
				});
			})
			.catch(err => {
				// catch sendLogin() error
				if (globalVars.env != "production") console.log(err);
				isCredInvalid = true;
				res.redirect("/authen/login/");
			});
	}
});

router.get("/logout", (req, res) => {
	req.session.destroy();
	res.redirect("/");
});

module.exports = router;
