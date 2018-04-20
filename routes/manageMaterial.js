const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const testData = require("../models/testData");
const ghp = require("../helpers/gql");
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
router.use(session(globalVars.sessionOptions));
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
	ghp.getMaterials(apollo_auth, req.session.currentDept.name)
		.then(m => {
			res.render("manage-material", {
				session: testData.session,
				user: testData.user,
				member: req.session.member,
				currentDept: req.session.currentDept,
				materials: m.data.department.materials
			});
		}).catch(err => console.log(err));
});
router.post("/new", multer().array(), (req, res) => {
	ghp.createMaterial(apollo_auth, req.session.currentDept.id, req.body.nameTh)
		.then(() => res.redirect("/manage-material/"))
		.catch(err => console.log(err));
})

module.exports = router;
