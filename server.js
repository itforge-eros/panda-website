const globalVars = require("./globalVars");
const express = require("express");
const app = express();
const env = process.env.NODE_ENV || "dev";
const port = env == "production" ? 3001 : 3000;
const session = require("express-session");
const compression = require("compression");
const ghp = require("./helpers/gql");

// Set view location
app.set("views", "./views");
// Set template engine
app.set("view engine", "pug");
// Set publicly-accessible path
app.use("/public", express.static(__dirname + "/public"));

// Routes
const authenRouter = require("./routes/authen");
const manageRequestRouter = require("./routes/manageRequest");
const manageRoleRouter = require("./routes/manageRole");
const manageSpaceRouter = require("./routes/manageSpace");
const manageReportRouter = require("./routes/manageReport");
const manageMaterialRouter = require("./routes/manageMaterial");
const spaceRouter = require("./routes/space");
const myRequestRouter = require("./routes/myRequest");
const chooseDeptRouter = require("./routes/chooseDept");

app.use(session(globalVars.sessionOptions));
app.use(compression());

app.use("/authen", authenRouter);
app.use("/manage-request", manageRequestRouter);
app.use("/manage-role", manageRoleRouter);
app.use("/manage-space", manageSpaceRouter);
app.use("/manage-report", manageReportRouter);
app.use("/manage-material", manageMaterialRouter);
app.use("/space", spaceRouter);
app.use("/my-request", myRequestRouter);
app.use("/choose-dept", chooseDeptRouter);

// Apollo
const ApolloClient = require("apollo-client").ApolloClient;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const createHttpLink = require("apollo-link-http").createHttpLink;
const setContext = require("apollo-link-context").setContext;
const fetch = require("node-fetch");
const gql = require("graphql-tag");
const apollo = new ApolloClient({
	link: createHttpLink({ uri: globalVars.gqlURL, fetch: fetch }),
	cache: new InMemoryCache()
});

app.get("/", (req, res) => {
	ghp.getDepartments(apollo)
		.then(depts => {
			res.render("index", {
				member: req.session.member,
				currentDept: req.session.currentDept,
				faculty: depts.data.departments
			});
		})
		.catch(err => {
			if (env != "production") console.log(err);
			res.redirect("/error/");
		})
});
app.get("/error", (req, res) => {
	res.render("error", {
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
app.get("/graphiql", (req, res) => {
	res.render("graphiql", {
		session: req.session,
		host: globalVars.apiHostname,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});

// Start the server
app.listen(port, () => {
	console.log("Server started\nListening on port " + port);
	console.log("Using API: " + globalVars.apiHostname);
	console.log("ENV: " + env);
});
