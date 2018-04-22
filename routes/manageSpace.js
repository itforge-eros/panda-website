const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const ghp = require("../helpers/gql");
const ahp = require("../helpers/authen");

const bodyParser = require("body-parser");
const multer = require("multer");

const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const fetch = require("node-fetch");
const gql = require("graphql-tag");

let token = "";
let createSpaceStatus = "";
let orgData = {};

const authLink = setContext((_, { headers }) => {
	return { headers: { authorization: token ? `bearer${token}` : "" } };
});

// Apollo with an auth token
const apollo_auth = new ApolloClient({
	link: authLink.concat(
		createHttpLink({ uri: globalVars.gqlURL, fetch: fetch })
	),
	cache: new InMemoryCache(),
	defaultOptions: {query: {fetchPolicy: "no-cache"}}
});

const amenities = [
	{ id: "PROJECTOR", name: "โปรเจ็กเตอร์" },
	{ id: "AIR_CONDITIONER", name: "แอร์" },
	{ id: "SPEAKER", name: "ระบบเสียง" },
	{ id: "INSTRUCTOR_PC", name: "คอมฯ ผู้สอน" }
];

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use((req, res, next) => {token = req.session.token; next()});

router.get("/", (req, res) => {
	if (req.session.member && ahp.hasEitherAccess(req.session.member.currentAccesses, ["SPACE_CREATE_ACCESS", "SPACE_UPDATE_ACCESS"])) {
		ghp.getSpacesInDepartment(apollo_auth, req.session.currentDept.name)
			.then(spaces => {
				res.render("manage-space", {
					session: testData.session,
					user: testData.user,
					member: req.session.member,
					currentDept: req.session.currentDept,
					spaces: spaces.data.department.spaces
				});
			})
			.catch(err => {
				res.redirect("/error/");
			});
	} else {
		res.redirect("/error/")
	}
});
router.get("/new", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["SPACE_CREATE_ACCESS"])) {
		res.render("manage-space-single", {
			session: testData.session,
			user: testData.user,
			member: req.session.member,
			currentDept: req.session.currentDept,
			amenities: amenities,
			orgData: orgData,
			status: createSpaceStatus,
			canSave: true,
			isNew: true
		});
		orgData = {};
		createSpaceStatus = "";
	} else {
		res.redirect("/error/");
	}
});
router.get("/:dept/:name", (req, res) => {
	if (req.session.member && ahp.hasEitherAccess(req.session.member.currentAccesses, ["SPACE_CREATE_ACCESS", "SPACE_UPDATE_ACCESS"])) {
		ghp.getSpace(apollo_auth, req.params.dept, req.params.name)
			.then(data => {
				res.render("manage-space-single", {
					session: testData.session,
					user: testData.user,
					member: req.session.member,
					currentDept: req.session.currentDept,
					amenities: amenities,
					orgData: data.data.space,
					status: createSpaceStatus,
					canSave: ahp.hasAllAccess(req.session.member.currentAccesses, ["SPACE_UPDATE_ACCESS"]),
					isNew: false
				});
				orgData = {};
				createSpaceStatus = "";
			})
			.catch(err => console.log(err))
	} else {
		res.redirect("/error/");
	}
});
router.post(/\/.*\/create/, multer().array(), (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["SPACE_CREATE_ACCESS"])) {
		req.body.deptId = req.session.currentDept.id;
		ghp.createSpace(apollo_auth, req.body)
			.then(data => {
				createSpaceStatus = "success";
				res.redirect("/manage-space/" + data.data.createSpace.department.name + "/" + data.data.createSpace.name + "/");
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				createSpaceStatus = err.graphQLErrors[0].message;
				orgData = req.body;
				res.redirect("/manage-space/new/");
			});
	} else {
		res.redirect("/error/");
	}
});
router.post(/\/.*\/update/, multer().array(), (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["SPACE_UPDATE_ACCESS"])) {
		ghp.updateSpace(apollo_auth, req.body)
			.then(data => {
				createSpaceStatus = "success";
				res.redirect("/manage-space/" + data.data.updateSpace.department.name + "/" + data.data.updateSpace.name + "/");
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				createSpaceStatus = err.graphQLErrors[0].message;
				orgData = req.body;
				res.redirect("/manage-space/" + req.body.deptId + "/" + req.body.orgSpaceName + "/");
			})
	} else {
		res.redirect("/error/");
	}
});

module.exports = router;
