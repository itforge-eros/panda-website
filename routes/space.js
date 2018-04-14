const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

const bodyParser = require("body-parser");
const multer = require("multer");

const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const fetch = require("node-fetch");
const gql = require("graphql-tag");

const apollo = new ApolloClient({
	link: createHttpLink({ uri: globalVars.gqlURL, fetch: fetch }),
	cache: new InMemoryCache()
});

const getSpace = id => {
	return apollo.query({
		query: gql`
			{
				space(id: "${id}") {
					id, name, description, capacity, isAvailable, department {name}
				}
			}
		`
	});
};

let reservation = {};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/:id", (req, res) => {
	getSpace(req.params.id)
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
			console.log(error);
			res.redirect("/error");
		});
});

router.post("/reserve", multer().array(), (req, res) => {
	if (req.session.member) {
		reservation = req.body;
		getSpace(req.body.space)
			.then(returnedSpace => {
				if (returnedSpace.data.space != null) {
					res.render("fill-request", {
						session: testData.session,
						user: testData.user,
						member: req.session.member,
						reservation: reservation,
						space: returnedSpace.data.space
					});
				} else {
					res.redirect("/error");
				}
			})
			.catch(error => {
				console.log(error);
				res.redirect("/error");
			});
	} else {
		res.redirect("/authen/login");
	}
});

router.post("/reserve/submit", multer().array(), (req, res) => {
	if (req.session.member) {
		// submit form
		res.render("request-sent", {
			session: testData.session,
			user: testData.user,
			member: req.session.member
		});
	} else {
		res.redirect("/error")
	}
});

module.exports = router;
