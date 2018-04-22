const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const dhp = require("../helpers/date");
const ghp = require("../helpers/gql");
const ahp = require("../helpers/authen");
const R = require("Ramda");

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
	if (req.session.member){ 
		ghp.getPermissionsAndRequestsBySPECIFIC_Department(apollo_auth, req.session.currentDept.name).then(requestInfo => {
			if (ahp.hasAllAccess(req.session.member.currentAccesses, ["REVIEW_CREATE_ACCESS"])) 
					{ res.render("manage-request", {
						session: req.session,
						user: testData.user,
						member: req.session.member,
						currentDept: req.session.currentDept,
						fullThaiCurrentDeptName: requestInfo.data.department.fullThaiName,
						id: req.params.id,
						reqInfo: (R.chain(space => space.requests, requestInfo.data.department.spaces))
					}); 
				// console.log(requestInfo.data.department.spaces[0])
				console.log(R.chain(space => space.requests, requestInfo.data.department.spaces));
			}

            else { console.log("still stuck") } 
		}).catch(error => {if (globalVars.env != "production") console.log(error); 
		res.redirect("/error");})
	} else {
		res.redirect("/authen/login");
	}
});

router.get("/:id", (req, res) => {
			if (req.session.member){ 
		ghp.getDetailOfViewSpaces(apollo_auth, req.params.id).then(detailEachSpace => {
			console.log(detailEachSpace.data.request.id);
					 res.render("manage-request-single", {
							session: testData.session,
							user: testData.user,
							member: req.session.member,
							currentDept: req.session.currentDept,
							id: req.params.id,
							details: detailEachSpace,
					}); 
				// console.log(requestInfo.data.department.spaces[0])
		}).catch(error => {if (globalVars.env != "production") console.log(error); 
		res.redirect("/error");})
	} else {
		res.redirect("/authen/login");
	}
});

module.exports = router;

