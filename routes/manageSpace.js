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
let createSpaceStatus = "";

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

const getSpace = (dept, spaceName) => {
	return apollo_auth.query({
		query: gql`
			{
				space(department: "${dept}", name: "${spaceName}") {
					id, name, fullName, description, capacity, isAvailable, department {name fullThaiName}
				}
			}
		`
	});
};

const createSpace = sp => {
	return apollo_auth.mutate({
		mutation: gql`
			mutation($spaceInput: CreateSpaceInput!) {
				createSpace(input: $spaceInput) {
					name department { name }
				}
			}
		`,
		variables: {
			"spaceInput": {
				"name": sp.name,
				"fullName": sp.fullName,
				"description": sp.description,
				"capacity": parseInt(sp.capacity),
				"category": sp.category,
				"isAvailable": sp.isAvailable == "true" ? true : false,
				"departmentId": sp.deptId
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
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
router.get("/new", (req, res) => {
	if (req.session.member) {
		res.render("manage-space-single", {
			session: testData.session,
			user: testData.user,
			member: req.session.member,
			currentDept: req.session.currentDept,
			amenities: amenities,
			orgData: {},
			status: createSpaceStatus
		});
		createSpaceStatus = "";
	} else {
		res.redirect("/authen/login/");
	}
});
router.get("/:dept/:name", (req, res) => {
	getSpace(req.params.dept, req.params.name)
		.then(data => {
			res.render("manage-space-single", {
				session: testData.session,
				user: testData.user,
				member: req.session.member,
				currentDept: req.session.currentDept,
				amenities: amenities,
				orgData: data.data.space,
				status: createSpaceStatus
			});
			createSpaceStatus = "";
		})
		.catch(err => console.log(err))
});
router.post(/\/.*\/save/, multer().array(), (req, res) => {
	if (req.session.member) {
		req.body.deptId = req.session.currentDept.id;
		createSpace(req.body)
			.then(data => {
				createSpaceStatus = "success";
				res.redirect("/manage-space/" + data.data.createSpace.department.name + "/" + data.data.createSpace.name + "/");
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				createSpaceStatus = "error";
			});
	} else {
		res.redirect("/authen/login/")
	}
});

module.exports = router;
