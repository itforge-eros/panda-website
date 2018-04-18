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

// Apollo with an auth token
const apollo_auth = new ApolloClient({
	link: authLink.concat(
		createHttpLink({ uri: globalVars.gqlURL, fetch: fetch })
	),
	cache: new InMemoryCache()
});

const amenities = [
	{ id: "PROJECTOR", name: "โปรเจ็กเตอร์" },
	{ id: "AIR_CONDITIONER", name: "แอร์" },
	{ id: "SPEAKER", name: "ระบบเสียง" },
	{ id: "INSTRUCTOR_PC", name: "คอมฯ ผู้สอน" }
];

const createSpace = sp => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($spaceInput: CreateSpaceInput!) {
				createSpace(input: $spaceInput) {
					id
				}
			}
		`,
		variables: {
			"spaceInput": {
				"name": sp.name,
				"fullName": sp.fullName,
				"description": sp.description,
				"capacity": parseInt(sp.capacity),
				"isAvailable": sp.isAvailable == "true" ? true : false,
				"departmentId": "3bl08h4mwWUvFBj18AK2DX"
			}
		}
	});
};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use((req, res, next) => {
	token = req.session.token;
	next()
});

router.get("/", (req, res) => {
	res.render("manage-space", {
		session: testData.session,
		user: testData.user,
		member: req.session.member
	});
});
router.get("/new", (req, res) => {
	let orgData = {capacity: 20, fullName: "M03", type: "lecture_room", name: "it-auditorium"};
	if (req.session.member) {
		res.render("manage-space-single", {
			session: testData.session,
			user: testData.user,
			member: req.session.member,
			amenities: amenities,
			orgData: orgData
		});
		console.log(orgData.capacity);
	} else {
		res.redirect("/authen/login/");
	}
});
router.get("/:id", (req, res) => {
	res.render("manage-space-single", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		amenities: amenities
	});
});
router.post(/\/.*\/save/, multer().array(), (req, res) => {
	if (req.session.member) {
		createSpace(req.body)
			.then(space => {
				res.redirect("/manage-space/");
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
			});
	} else {
		res.redirect("/authen/login/")
	}
});

module.exports = router;
