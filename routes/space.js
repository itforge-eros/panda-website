const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const fetch = require("node-fetch");
const gql = require("graphql-tag");

const apollo = new ApolloClient({
	uri: globalVars.apiURL,
	link: createHttpLink({ uri: globalVars.apiURL, fetch: fetch }),
	cache: new InMemoryCache()
});

const getSpace = id => {
	return apollo.query({
		query: gql`
			{
				space(id: "${id}") {
					id, name, description, capacity, isAvailable
				}
			}
		`
	});
};

router.get("/:id", (req, res) => {
	getSpace(req.params.id)
		.then(returnedData => {
			if (returnedData.data.space != null) {
				res.render("single-space", {
					session: testData.session,
					user: testData.user,
					faculty: testData.faculty,
					space: returnedData.data.space
				});
			} else {
				res.redirect("/error");
			}
		})
		.catch(() => {
			res.redirect("/error");
		});
});

module.exports = router;
