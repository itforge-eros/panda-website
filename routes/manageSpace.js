const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
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
let deleteSpaceStatus = "";
let orgData = {};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use((req, res, next) => {token = req.session.token; next()});

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
	{ id: "projector", name: "โปรเจ็กเตอร์" },
	{ id: "air-conditioner", name: "แอร์" },
	{ id: "speaker", name: "ระบบเสียง" },
	{ id: "instructor-pc", name: "คอมฯ ผู้สอน" },
	{ id: "apple-tv", name: "Apple TV" }
];

const spaceTypes = [
	{x: "ห้องเรียน", v: "classroom"},
	{x: "ห้องประชุม", v: "meeting_room"},
	{x: "แล็บคอมพิวเตอร์", v: "computer_lab"}
];

router.get("/", (req, res) => {
	let acc = req.session.member.currentAccesses;
	if (req.session.member && 
		ahp.hasEitherAccess(acc, ["SPACE_CREATE_ACCESS", "SPACE_UPDATE_ACCESS", "SPACE_DELETE_ACCESS", "PROBLEM_READ_ACCESS"])) {
		if (acc.includes("PROBLEM_READ_ACCESS") && !acc.includes("SPACE_CREATE_ACCESS") && 
			!acc.includes("SPACE_UPDATE_ACCESS") && !acc.includes("SPACE_DELETE_ACCESS")) {
			res.redirect("/manage-report/");
		} else {
			ghp.getSpacesInDepartment(apollo_auth, req.session.currentDept.name)
				.then(spaces => {
					res.render("manage-space", {
						member: req.session.member,
						currentDept: req.session.currentDept,
						spaces: spaces.data.department.spaces,
						createSpaceStatus: createSpaceStatus,
						deleteSpaceStatus: deleteSpaceStatus
					});
					orgData = {};
					createSpaceStatus = "";
					deleteSpaceStatus = "";
				})
				.catch(err => {
					res.redirect("/error/");
				});
		}
	} else {
		res.redirect("/error/")
	}
});
router.get("/new", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["SPACE_CREATE_ACCESS"])) {
		res.render("manage-space-single", {
			member: req.session.member,
			currentDept: req.session.currentDept,
			amenities: amenities,
			spaceTypes: spaceTypes,
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
router.get("/:id/delete", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["SPACE_DELETE_ACCESS"])) {
		ghp.deleteSpace(apollo_auth, req.params.id)
			.then(data => {
				deleteSpaceStatus = "success";
				res.redirect("/manage-space/");
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				deleteSpaceStatus = err.graphQLErrors[0].message;
				res.redirect("/manage-space/");
			})
	} else {
		res.redirect("/error/");
	}
});
router.get("/:dept/:name", (req, res) => {
	if (req.session.member && ahp.hasEitherAccess(req.session.member.currentAccesses, ["SPACE_CREATE_ACCESS", "SPACE_UPDATE_ACCESS"])) {
		ghp.getSpace(apollo_auth, req.params.dept, req.params.name)
			.then(data => {
				res.render("manage-space-single", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					amenities: amenities,
					spaceTypes: spaceTypes,
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
				res.redirect("/manage-space/");
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
