const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const ghp = require("../helpers/gql");
const ahp = require("../helpers/authen");

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
let deleteRoleStatus = "";
let updateRoleStatus = "";

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

// manage-role
router.get("/", (req, res) => {
	if (req.session.member && ahp.hasEitherAccess(req.session.member.currentAccesses, ["ROLE_CREATE_ACCESS", "ROLE_ASSIGN_ACCESS", "ROLE_UPDATE_ACCESS"])) {
		ghp.getRolesInDepartment(apollo_auth, req.session.currentDept.name)
			.then(roles => {
				res.render("manage-role", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					roles: roles.data.department.roles,
					deleteRoleStatus: deleteRoleStatus
				});
				orgData = {};
				deleteRoleStatus = "";
				createRoleStatus = "";
			})
			.catch(err => {
				res.redirect("/error/")
			})
	} else { res.redirect("/error/") }
});

// new role
router.get("/new", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["ROLE_CREATE_ACCESS"])) {
		ghp.getPermissions(apollo_auth)
			.then(permissions => {
				res.render("manage-role-single", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					orgData: orgData,
					role: {permissions: []}, // current role (empty because we're creating a new role)
					permissions: permissions.data.permissions,
					status: createRoleStatus,
					isNew: true,
					canSave: true
				});
				orgData = {};
				createRoleStatus = "";
			})
			.catch(err => {
				res.redirect("/error/")
			})
	} else { res.redirect("/error/") }
});

// save new role
router.post(/\/.*\/create/, multer().array(), (req, res) => {
	if (req.session.member && ahp.hasEitherAccess(req.session.member.currentAccesses, ["ROLE_CREATE_ACCESS", "ROLE_UPDATE_ACCESS"])) {
		req.body.deptId = req.session.currentDept.id;
		ghp.createRole(apollo_auth, req.body)
			.then(data => {
				createRoleStatus = "success";
				res.redirect("/manage-role/");
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				createRoleStatus = err.graphQLErrors[0].message;
				orgData = req.body;
				res.redirect("/manage-role/new/");
			});
	} else { res.redirect("/authen/login/") }
});

// role setting
router.get("/:id", (req, res) => {
	let myRoleIds = req.session.member.roles.map(r => r.id);
	if (req.session.member &&
		ahp.hasEitherAccess(req.session.member.currentAccesses, ["ROLE_CREATE_ACCESS", "ROLE_UPDATE_ACCESS"])) {
		ghp.getRole(apollo_auth, req.params.id)
			.then(role => {
				ghp.getPermissions(apollo_auth)
					.then(permissions => {
						res.render("manage-role-single", {
							member: req.session.member,
							currentDept: req.session.currentDept,
							status: updateRoleStatus,
							permissions: permissions.data.permissions,
							role: role.data.role,
							isNew: false,
							canSave: ahp.hasAllAccess(req.session.member.currentAccesses, ["ROLE_UPDATE_ACCESS"]) && !myRoleIds.includes(req.params.id)
						});
						orgData = {};
						createRoleStatus = "";
					})
					.catch(err => res.redirect("/error/") )
			})
			.catch(err => res.redirect("/error/") );
	} else { res.redirect("/error/") }
});

// role member
router.get("/:id/users", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["ROLE_ASSIGN_ACCESS"])) {
		ghp.getRoleMembers(apollo_auth, req.params.id)
			.then(role => {
				res.render("manage-role-user", {
					member: req.session.member,
					memberToken: req.session.token,
					currentDept: req.session.currentDept,
					role: role.data.role,
					status: assignMemberStatus
				});
				assignMemberStatus = "";
			})
			.catch(err => res.redirect("/error/"));
	} else { res.redirect("/error/") }
});

// add role member
router.post("/:id/users/addmember", multer().array(), (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["ROLE_ASSIGN_ACCESS"])) {
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
	} else { res.redirect("/error/") }
});

// update role setting
router.post("/:id/update", multer().array(), (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["ROLE_UPDATE_ACCESS"])) {
		req.body.roleId = req.params.id;
		ghp.updateRole(apollo_auth, req.body)
			.then(data => {
				res.redirect("/manage-role/" + req.params.id + "/");
				updateRoleStatus = "success";
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error/");
			})
	} else { req.redirect("/error/") }
})

// delete role
router.get("/:id/delete", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["ROLE_DELETE_ACCESS"])) {
		ghp.deleteRole(apollo_auth, req.params.id)
			.then(data => {
				deleteRoleStatus = "success";
				res.redirect("/manage-role/");
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error/");
			});
	} else { res.redirect("/error/") }
})

module.exports = router;
