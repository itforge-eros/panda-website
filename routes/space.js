const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const ghp = require("../helpers/gql");

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
	cache: new InMemoryCache(),
	defaultOptions: {query: {fetchPolicy: "no-cache"}}
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/:dept/:name", (req, res) => {
	token = req.session.token;
	ghp.getSpace(apollo, req.params.dept, req.params.name)
		.then(returnedData => {
			if (returnedData.data.space != null) {
				res.render("single-space", {
					member: req.session.member,
					memberToken: req.session.token,
					currentDept: req.session.currentDept,
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
		ghp.getSpace(apollo_auth, req.params.dept, req.params.name)
			.then(returnedSpace => {
				if (returnedSpace.data.space != null) {
					ghp.getMaterials(apollo_auth, returnedSpace.data.space.department.name)
						.then(returnedMaterials => {
							res.render("fill-request", {
								member: req.session.member,
								currentDept: req.session.currentDept,
								reservation: req.body,
								space: returnedSpace.data.space,
								materials: returnedMaterials.data.department.materials
							});
						})
						.catch(err => res.redirect("/error"))
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
		ghp.createRequest(apollo_auth, req.body)
			.then(rp => {
				res.render("request-sent", {
					member: req.session.member,
					currentDept: req.session.currentDept
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
