const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const dhp = require("../helpers/date");
const ghp = require("../helpers/gql");

const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const fetch = require("node-fetch");
const gql = require("graphql-tag");
let token = "";

router.use((req, res, next) => {
	token = req.session.token;
	next()
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

router.get("/", (req, res) => {
	if (req.session.member) {
		ghp.getCanApprove(apollo_auth, req.session.currentDept.name)
			.then(canSee => {
				if(canSee.data.me.accesses.indexOf("REVIEW_CREATE_ACCESS")) //allowed
				{
					ghp.getSpacesInDepartment(apollo_auth, req.session.currentDept.name)
					.then(spaces => {
							const updatedRequests = [];
							console.log(spaces.data.department.spaces.length);
							for (var i = 0; i < spaces.data.department.spaces.length; i++) {
								let tmp = Object.assign({}, spaces.data.department.spaces[i]);
								updatedRequests.push(tmp)
								console.log(updatedRequests);
							} res.render("manage-request", {
								session: testData.session,
								user: testData.user,
								member: req.session.member,
								currentDept: req.session.currentDept,
								canSee: updatedRequests,
								})
							})
				}
				else {

				}
						
				// console.log(canSee.data.me.accesses);
				// console.log(testData.session);
				// console.log(testData.use);
				// console.log(req.session.member);
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
			});
	} else {
		res.redirect("/authen/login");
	}
});

router.get("/:id", (req, res) => {
		res.render("manage-request-single", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept,
		id: req.params.id,
		reqInfo: testData.requestInfo
	});
});

module.exports = router;

