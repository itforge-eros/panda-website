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
				let allRequests = R.chain(space => space.requests, returnedRequests.data.department.spaces);
				let unmanagedRequests = allRequests.filter(r => r.status == "PENDING");
				let formattedUnmanagedRequests = [];
				unmanagedRequests.map(r => {
					let tmp = {...r};
					tmp.dates_th = tmp.dates.map(d => dhp.thaiDateOf(dhp.bigEndianToDate(d)));
					tmp.startTime = dhp.slotToTime(r.period.start);
					tmp.endTime = dhp.slotToTime(r.period.end);
					formattedUnmanagedRequests.push(tmp);
				});
				res.render("manage-request", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					thisTab: "a",
					dept_fullThaiName: returnedRequests.data.department.fullThaiName,
					reqInfo: formattedUnmanagedRequests
				}); 
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err); 
				res.redirect("/error/");
			});
	} else { res.redirect("/error/") }
});

router.get("/archive", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["REVIEW_CREATE_ACCESS"])) {
		ghp.getRequestsInDepartment(apollo_auth, req.session.currentDept.name)
			.then(returnedRequests => {
				let allRequests = R.chain(space => space.requests, returnedRequests.data.department.spaces);
				let managedRequests = allRequests.filter(r => r.status != "PENDING");
				let formattedManagedRequests = [];
				managedRequests.map(r => {
					let tmp = {...r};
					tmp.dates_th = tmp.dates.map(d => dhp.thaiDateOf(dhp.bigEndianToDate(d)));
					tmp.startTime = dhp.slotToTime(r.period.start);
					tmp.endTime = dhp.slotToTime(r.period.end);
					formattedManagedRequests.push(tmp);
				});
				res.render("manage-request", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					thisTab: "b",
					dept_fullThaiName: returnedRequests.data.department.fullThaiName,
					reqInfo: formattedManagedRequests
				});
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err); 
				res.redirect("/error/");
			});
	} else { res.redirect("/error/") }
})

router.get("/:id", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["REVIEW_CREATE_ACCESS"])) {
		ghp.getRequestDetailForReviewing(apollo_auth, req.params.id)
			.then(detailEachSpace => {
				let updatedData = {
					createdAt_th: dhp.thaiDateOf(dhp.epochToDate(detailEachSpace.data.request.createdAt)),
					dates_th: detailEachSpace.data.request.dates.map(d => dhp.thaiDateOf(dhp.bigEndianToDate(d))),
					startTime: dhp.slotToTime(detailEachSpace.data.request.period.start),
					endTime: dhp.slotToTime(detailEachSpace.data.request.period.end)
				}
				const rq = {...updatedData, ...detailEachSpace.data.request};
				res.render("manage-request-single", {
						member: req.session.member,
						currentDept: req.session.currentDept,
						id: req.params.id,
						details: rq,
				});
			})
			.catch(error => {
				if (globalVars.env != "production") console.log(error);
				res.redirect("/error/");
			});
	} else { res.redirect("/error/") }
});

router.get("/:id/:event", (req, res) => {
	if (req.session.member) {
		ghp.createReview(apollo_auth, req.params.id, req.params.event)
			.then(detail => {
				res.redirect("/manage-request/");
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error/");
			});
	} else { res.redirect("/error/") }
});

module.exports = router;
