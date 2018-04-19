const globalVars = require("./globalVars");
const express = require("express");
const app = express();
const env = process.env.NODE_ENV || "dev";
const port = env == "production" ? 3001 : 3000;
const session = require("express-session");
const compression = require("compression");

// Set view location
app.set("views", "./views");
// Set template engine
app.set("view engine", "pug");
// Set publicly-accessible path
app.use("/public", express.static(__dirname + "/public"));

// Data
const testData = require("./models/testData");

// Routes
const authenRouter = require("./routes/authen");
const manageRequestRouter = require("./routes/manageRequest");
const manageRoleRouter = require("./routes/manageRole");
const manageSpaceRouter = require("./routes/manageSpace");
const manageReportRouter = require("./routes/manageReport");
const manageMaterialRouter = require("./routes/manageMaterial");
const spaceRouter = require("./routes/space");
const myRequestRouter = require("./routes/myRequest");

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

app.get("/", (req, res) => {
	res.render("index", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept,
		faculty: testData.faculty
	});
});
app.get("/error", (req, res) => {
	res.render("error", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
app.get("/graphiql", (req, res) => {
	res.render("graphiql", {
		session: req.session,
		user: testData.user,
		host: globalVars.apiHostname,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
app.get("/choose-dept", (req, res) => {
	res.render("choose-dept", {
		session: req.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
app.get("/choose-dept/:dept", (req, res) => {
	req.session.currentDept = req.params.dept;
	res.redirect("/");
})

// Start the server
app.listen(port, () => {
	console.log("Server started\nListening on port " + port);
	console.log("Using API: " + globalVars.apiHostname);
	console.log("ENV: " + env);
});
