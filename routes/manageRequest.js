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
	if (req.session.member){ //&& !(Object.keys(req.session.currentDept).length === 0)) {
		ghp.getCanApprove(apollo_auth, req.session.currentDept.name)
			.then(canSee => {
				console.log(canSee.data.me.accesses);
				if(canSee.data.me.accesses.indexOf("REVIEW_CREATE_ACCESS") !== -1) //allowed to See The Requests of each department that You can approve
				{
					ghp.getSpacesInDepartment(apollo_auth, req.session.currentDept.name)
					.then(spaces => {
							const updatedRequests = [];
							// console.log(spaces.data.department.spaces);
							for (var i = 0; i < spaces.data.department.spaces.length; i++) {
								let tmp = Object.assign({}, spaces.data.department.spaces[i]);
								// updatedRequests.push(tmp)
								console.log(tmp.name);
								ghp.findRequests(apollo_auth, req.session.currentDept.name, tmp.name)
								.then(requests => { 
									for (var i = 0; i < requests.data.space.requests.length; i++) {
									let tmp1 = Object.assign({}, requests.data.space.requests[i]);
									updatedRequests.push(tmp1)
								}
									res.render("manage-request", {
									session: testData.session,
									user: testData.user,
									member: req.session.member,
									currentDept: req.session.currentDept,
									requestsFrom: updatedRequests,
									currectSpace: requests.data.space,
								})
									console.log(updatedRequests);
									}).catch(err => { if (globalVars.env != "production") console.log(err); })
							}
						}).catch(err => { if (globalVars.env != "production") console.log(err); })
					}
				else {
					console.log("aaaa");
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

