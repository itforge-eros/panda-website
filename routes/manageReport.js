const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const ghp = require("../helpers/gql");
const ahp = require("../helpers/authen");
const dhp = require("../helpers/date");
const session = require("express-session");

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
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["PROBLEM_READ_ACCESS"])) {
		ghp.getProblemsInDepartment(apollo_auth, req.session.currentDept.name)
			.then(problemsBySpaces => {
				let problemList = [];
				problemsBySpaces.data.department.spaces.map(s => {
					if (s.problems.length > 0) {
						for (let i = 0; i < s.problems.length; i++) {
							problemList.push({
								id: s.problems[i].id,
								title: s.problems[i].title,
								isRead: s.problems[i].isRead,
								spaceName: s.fullName
							});
						}
					}
				})
				res.render("manage-report", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					problems: problemList
				});
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error/");
			})
	} else { res.redirect("/error/") }
});
router.get("/:id", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["PROBLEM_READ_ACCESS"])) {
		ghp.getProblem(apollo_auth, req.params.id)
			.then(returnedProblem => {
				let updatedData = {
					createdAt_th: dhp.thaiDateOf(dhp.epochToDate(returnedProblem.data.problem.createdAt))
				}
				const problem = Object.assign({}, returnedProblem.data.problem, updatedData);
				res.render("manage-report-single", {
					member: req.session.member,
					currentDept: req.session.currentDept,
					problem: problem
				});
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
			res.redirect("/error/");
			})
	} else { res.redirect("/error/") }
});
router.get("/:id/isread", (req, res) => {
	if (req.session.member && ahp.hasAllAccess(req.session.member.currentAccesses, ["PROBLEM_UPDATE_ACCESS"])) {
		ghp.updateProblem(apollo_auth, req.params.id)
			.then(data => {
				res.redirect("/manage-report/")
			})
			.catch(err => {
				if (globalVars.env != "production") console.log(err);
				res.redirect("/error")
			});
	} else { res.redirect("/error/") }
})

module.exports = router;
