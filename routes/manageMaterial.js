const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const ghp = require("../helpers/gql");
const ahp = require("../helpers/authen");
const session = require("express-session");
const multer = require("multer");
const bodyParser = require("body-parser");

// required for apollo
const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const fetch = require("node-fetch");
const gql = require("graphql-tag");

// token for apollo
let token = "";

router.use((req, res, next) => {token = req.session.token; next()});
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

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
	if (req.session.member && ahp.hasEitherAccess(req.session.member.currentAccesses, ["MATERIAL_CREATE_ACCESS", "MATERIAL_DELETE_ACCESS"])) {
		ghp.getMaterials(apollo_auth, req.session.currentDept.name)
			.then(m => {
				res.render("manage-material", {
					session: testData.session,
					member: req.session.member,
					memberToken: req.session.token,
					currentDept: req.session.currentDept,
					materials: m.data.department.materials
				});
			}).catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error/");
			});
	} else { res.redirect("/error/") }
});
router.post("/new", multer().array(), (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["MATERIAL_CREATE_ACCESS"])) {
		ghp.createMaterial(apollo_auth, req.session.currentDept.id, req.body.nameTh)
			.then(() => res.redirect("/manage-material/"))
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error/");
			});
	} else { res.redirect("/error/") }
})

module.exports = router;
