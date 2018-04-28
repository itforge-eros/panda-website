const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
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
		ghp.getMyRequests(apollo_auth)
			.then(myRequests => {
				const updatedRequests = [];
				myRequests.data.me.requests.map(r => {
					let tmp = {...r};
					tmp.createdAt_th = dhp.thaiDateOf(dhp.epochToDate(tmp.createdAt));
					tmp.dates_th = tmp.dates.map(d => dhp.thaiDateOf(dhp.bigEndianToDate(d)));
					tmp.startTime = dhp.slotToTime(r.period.start);
					tmp.endTime = dhp.slotToTime(r.period.end);
					updatedRequests.push(tmp);
				});
				res.render("my-request", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					myRequests: updatedRequests
				});
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
			});
	} else {
		res.redirect("/authen/login");
	}
});
router.get("/:id", (req, res) => {
	if (req.session.member) {
		ghp.getRequest(apollo_auth, req.params.id)
			.then(returnedReq => {
				let updatedData = {
					createdAt_th: dhp.thaiDateOf(dhp.epochToDate(returnedReq.data.request.createdAt)),
					dates_th: returnedReq.data.request.dates.map(d => dhp.thaiDateOf(dhp.bigEndianToDate(d))),
					startTime: dhp.slotToTime(returnedReq.data.request.period.start),
					endTime: dhp.slotToTime(returnedReq.data.request.period.end)
				}
				const rq = {...updatedData, ...returnedReq.data.request};
				res.render("single-request", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					reqInfo: rq,
					id: req.params.id
				});
			}).catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error");
			});
	} else {
		res.redirect("/authen/login");
	}
});

module.exports = router;
