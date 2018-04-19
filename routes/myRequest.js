const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const dhp = require("../helpers/date");

const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const fetch = require("node-fetch");
const gql = require("graphql-tag");

let token = "";

const authLink = setContext((_, { headers }) => {
	return { headers: { authorization: token ? `bearer${token}` : "" } };
});

const apollo_auth = new ApolloClient({
	link: authLink.concat(
		createHttpLink({ uri: globalVars.gqlURL, fetch: fetch })
	),
	cache: new InMemoryCache()
});

const getRequest = id => {
	return apollo_auth.query({
		query: gql`
			{
				request(id: "${id}") {
					id
					client { firstName lastName }
					body
					dates
					period { start end }
					status
					createdAt
					space { fullName department { fullThaiName } }
				}
			}
		`
	});
};

const getMyRequests = () => {
	return apollo_auth.query({
		query: gql`
			{
				me {
					requests {
						id dates period {start end} status createdAt
						space {fullName department {fullThaiName}}
					}
				}
			}
		`
	})
}

router.use((req, res, next) => {
	token = req.session.token;
	next()
});

router.get("/", (req, res) => {
	// token = req.session.token;
	console.log("Entered");
	if (req.session.member) {
		getMyRequests()
			.then(myRequests => {
				console.log("Got the data");
				console.log(myRequests.data.me.requests);
				const updatedRequests = [];
				
				for (var i = 0; i < myRequests.data.me.requests.length; i++) {
					let tmp = Object.assign({}, myRequests.data.me.requests[i]);
					tmp.createdAt_th = dhp.thaiDateOf(dhp.epochToDate(tmp.createdAt));
					tmp.dates_th = tmp.dates.map(d => dhp.thaiDateOf(dhp.bigEndianToDate(d)));
					updatedRequests.push(tmp)
				}

				console.log(updatedRequests);
				const rq = []
				res.render("my-request", {
					session: testData.session,
					user: testData.user,
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
		getRequest(req.params.id)
			.then(returnedReq => {
				let updatedData = {
					createdAt_th: dhp.thaiDateOf(dhp.epochToDate(returnedReq.data.request.createdAt)),
					dates_th: returnedReq.data.request.dates.map(d => dhp.thaiDateOf(dhp.bigEndianToDate(d)))
				}
				const rq = Object.assign({}, updatedData, returnedReq.data.request);
				if (globalVars.env != "production") console.log(rq);
				res.render("single-request", {
					session: testData.session,
					user: testData.user,
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
