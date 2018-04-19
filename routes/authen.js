const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const testData = require("../models/testData");

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
	cache: new InMemoryCache()
});

const sendLogin = (usr, pwd) => {
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

const getMe = () => {
	return apollo_auth.query({
		query: gql`
			{
				me {
					roles {
						department {
							name fullThaiName description
						}
						permissions {
							accesses
						}
					}
				}
			}
		`
	});
};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session(globalVars.sessionOptions));

let isCredEmpty = false;
let isCredInvalid = false;

router.get("/", (req, res, next) => {
	res.redirect("/");
});

router.get("/login", (req, res, next) => {
	res.render("login", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		isCredEmpty: isCredEmpty,
		isCredInvalid: isCredInvalid,
		currentDept: req.session.currentDept
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
		sendLogin(req.body.username, req.body.password)
			.then(data => {
				req.session.token = data.data.login.token;
				req.session.member = data.data.login.member;
				token = req.session.token;
				getMe().then(meData => {
					req.session.currentDept = "";
					req.session.member = Object.assign({}, req.session.member, meData.data.me);
					// console.log(req.session.member);
					if (req.session.member.roles.length > 1)
						res.redirect("/choose-dept/")
					else
						res.redirect("/");
				}).catch(err => {
					if (globalVars.env != "production") console.log(err);
				})
			})
			.catch(err => {
				// console.log(err.graphQLErrors[0].message);
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
