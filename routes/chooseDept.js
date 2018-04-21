const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const ghp = require("../helpers/gql");

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

router.get("/", (req, res) => {
	res.render("choose-dept", {
		session: req.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
router.get("/:dept/:id", (req, res) => {
	req.session.currentDept = {name: req.params.dept, id: req.params.id};
	ghp.getAccesses(apollo_auth, req.session.currentDept.name)
		.then(accesses => {
			req.session.member.currentAccesses = accesses.data.me.accesses;
			res.redirect("/")
		}).catch(err => {
			if (globalVars.env != "production") console.log(err);
			res.redirect("/error/");
		});
});

module.exports = router
