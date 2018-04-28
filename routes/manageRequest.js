const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const dhp = require("../helpers/date");
const ghp = require("../helpers/gql");
const ahp = require("../helpers/authen");
const R = require("ramda");

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
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["REVIEW_CREATE_ACCESS"])) {
		ghp.getRequestsInDepartment(apollo_auth, req.session.currentDept.name)
			.then(returnedRequests => {
				res.render("manage-request", {
					member: req.session.member,
					dept_fullThaiName: returnedRequests.data.department.fullThaiName,
					reqInfo: (R.chain(space => space.requests, returnedRequests.data.department.spaces))
				}); 
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err); 
				res.redirect("/error");
			});
	} else { res.redirect("/error/") }
});

router.get("/:id", (req, res) => {
			if (req.session.member){ 
		ghp.getDetailOfViewSpaces(apollo_auth, req.params.id).then(detailEachSpace => {
			let updatedData = {
					createdAt_th: dhp.thaiDateOf(dhp.epochToDate(detailEachSpace.data.request.createdAt)),
					dates_th: detailEachSpace.data.request.dates.map(d => dhp.thaiDateOf(dhp.bigEndianToDate(d))),
					startTime: dhp.slotToTime(detailEachSpace.data.request.period.start),
					endTime: dhp.slotToTime(detailEachSpace.data.request.period.end)
				}
				const rq = Object.assign({}, updatedData, detailEachSpace.data.request);
				// console.log(rq);
					 res.render("manage-request-single", {
							session: testData.session,
							user: testData.user,
							member: req.session.member,
							currentDept: req.session.currentDept,
							id: req.params.id,
							details: rq,
					}); 
				// console.log(requestInfo.data.department.spaces[0])
		}).catch(error => {if (globalVars.env != "production") console.log(error); 
		res.redirect("/error");})
	} else {
		res.redirect("/authen/login");
	}
});


router.get("/:id/review", (req, res) => {
	if (req.session.member){ 
		ghp.createReview(apollo_auth, req.params.id).then(details => {
			resultReview = "approve";
			res.redirect("/manage-request/");
		}).catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error/"); 
			});
	} else {
		res.redirect("/authen/login");
	}
});

module.exports = router;

