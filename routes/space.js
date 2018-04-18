const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

const bodyParser = require("body-parser");
const multer = require("multer");

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

// Apollo with no auth token
const apollo = new ApolloClient({
	link: createHttpLink({ uri: globalVars.gqlURL, fetch: fetch }),
	cache: new InMemoryCache()
});
// Apollo with an auth token
const apollo_auth = new ApolloClient({
	link: authLink.concat(
		createHttpLink({ uri: globalVars.gqlURL, fetch: fetch })
	),
	cache: new InMemoryCache()
});

const getSpace = (dept, spaceName) => {
	return apollo.query({
		query: gql`
			{
				space(department: "${dept}", name: "${spaceName}") {
					id, name, fullName, description, capacity, isAvailable, department {name fullThaiName}
				}
			}
		`
	});
};

const createRequest = rq => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($requestInput: CreateRequestInput!) {
				createRequest(input: $requestInput) {
					id
				}
			}
		`,
		variables: {
			"requestInput": {
				"dates": [rq.r_date_raw],
				"period": {
					"start": parseInt(rq.start),
					"end": parseInt(rq.end)
				},
				"spaceId": rq.space
			}
		}
	});
};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/:dept/:name", (req, res) => {
	token = req.session.token;
	getSpace(req.params.dept, req.params.name)
		.then(returnedData => {
			if (returnedData.data.space != null) {
				res.render("single-space", {
					session: testData.session,
					user: testData.user,
					member: req.session.member,
					faculty: testData.faculty,
					space: returnedData.data.space
				});
			} else {
				res.redirect("/error");
			}
		})
		.catch(error => {
			if (globalVars.env != "production") console.log(error);
			res.redirect("/error");
		});
});

router.post("/:dept/:name/reserve", multer().array(), (req, res) => {
	if (req.session.member) {
		getSpace(req.params.dept, req.params.name)
			.then(returnedSpace => {
				if (returnedSpace.data.space != null) {
					res.render("fill-request", {
						session: testData.session,
						user: testData.user,
						member: req.session.member,
						reservation: req.body,
						space: returnedSpace.data.space
					});
				} else {
					res.redirect("/error");
				}
			})
			.catch(error => {
				if (globalVars.env != "production") console.log(error);
				res.redirect("/error");
			});
	} else {
		res.redirect("/authen/login");
	}
});

router.post(/\/.*\/reserve\/submit/, multer().array(), (req, res) => {
	if (req.session.member) {
		createRequest(req.body)
			.then(rp => {
				if (globalVars.env != "production") console.log(rp);
				res.render("request-sent", {
					session: testData.session,
					user: testData.user,
					member: req.session.member
				});
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error");
			});
	} else {
		res.redirect("/error");
	}
});

module.exports = router;
