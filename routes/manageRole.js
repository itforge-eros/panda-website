const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const ghp = require("../helpers/gql");

const bodyParser = require("body-parser");
const multer = require("multer");

// required for apollo
const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const fetch = require("node-fetch");
const gql = require("graphql-tag");

// token for apollo
let token = "";
let createRoleStatus = "";
let orgData = {};
let assignMemberStatus = "";

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use((req, res, next) => {token = req.session.token; next()});

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
	ghp.getRolesInDepartment(apollo_auth, req.session.currentDept.name)
		.then(roles => {
			res.render("manage-role", {
				session: testData.session,
				user: testData.user,
				member: req.session.member,
				currentDept: req.session.currentDept,
				roles: roles.data.department.roles
			});
		})
		.catch(err => {
			res.redirect("/error/")
		})
});
router.get("/new", (req, res) => {
	if (req.session.member) {
		ghp.getPermissions(apollo_auth)
			.then(permissions => {
				res.render("manage-role-single", {
					session: testData.session,
					user: testData.user,
					member: req.session.member,
					currentDept: req.session.currentDept,
					orgData: orgData,
					role: {permissions: []}, // current role (empty because we're creating a new role)
					permissions: permissions.data.permissions,
					status: createRoleStatus
				});
				orgData = {};
				createRoleStatus = "";
			})
			.catch(err => {
				res.redirect("/error/")
			})
	} else { res.redirect("/authen/login/") }
});
router.post(/\/.*\/save/, multer().array(), (req, res) => {
	if (req.session.member) {
		req.body.deptId = req.session.currentDept.id;
		ghp.createRole(apollo_auth, req.body)
			.then(data => {
				createRoleStatus = "success";
				res.redirect("/manage-role/" + data.data.createRole.id);
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				createRoleStatus = err.graphQLErrors[0].message;
				orgData = req.body;
				res.redirect("/manage-role/new/");
			});
	} else {
		res.redirect("/authen/login/")
	}
});
router.get("/:id", (req, res) => {
	ghp.getRole(apollo_auth, req.params.id)
		.then(role => {
			ghp.getPermissions(apollo_auth)
				.then(permissions => {
					res.render("manage-role-single", {
						session: testData.session,
						user: testData.user,
						member: req.session.member,
						currentDept: req.session.currentDept,
						status: createRoleStatus,
						permissions: permissions.data.permissions,
						role: role.data.role
					});
					orgData = {};
					createRoleStatus = "";
				})
				.catch(err => res.redirect("/error/"))
		})
		.catch(err => res.redirect("/error/"));
});
router.get("/:id/users", (req, res) => {
	ghp.getRoleMembers(apollo_auth, req.params.id)
		.then(role => {
			res.render("manage-role-user", {
				session: testData.session,
				user: testData.user,
				member: req.session.member,
				currentDept: req.session.currentDept,
				role: role.data.role,
				status: assignMemberStatus
			});
			assignMemberStatus = "";
		})
		.catch(err => res.redirect("/error/"));
});
router.post("/:id/users/addmember", multer().array(), (req, res) => {
	ghp.getMemberId(apollo_auth, req.body.member)
		.then(member => {
			ghp.assignRole(apollo_auth, req.params.id, member.data.member.id)
				.then(() => {
					assignMemberStatus = "success";
					res.redirect("/manage-role/" + req.params.id + "/users/");
				})
				.catch(err => {
					assignMemberStatus = err.graphQLErrors[0].message;
					res.redirect("/manage-role/" + req.params.id + "/users/");
				})
		})
		.catch(err => {
			assignMemberStatus = err.graphQLErrors[0].message;
			res.redirect("/manage-role/" + req.params.id + "/users/");
		});
});

module.exports = router;
