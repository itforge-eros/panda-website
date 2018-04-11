const globalVars = require("./globalVars");
const express = require("express");
const app = express();
const env = process.env.NODE_ENV || "dev";
const port = env == "production" ? 80 : 3000;
const session = require("express-session");

const axios = require("axios");

axios(globalVars.gqlURL, {
	method: "POST",
	data: {
		query: `
			query {
				spaces {
					id, name
				}
			}
		`
	}
}).then(result => {
	searchResults = result.data;
	console.log(result.data);
}).catch(err => {
	console.log(err)
});

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
const spaceRouter = require("./routes/space");

app.use(session(globalVars.sessionOptions));

app.use("/authen", authenRouter);
app.use("/manage-request", manageRequestRouter);
app.use("/manage-role", manageRoleRouter);
app.use("/manage-space", manageSpaceRouter);
app.use("/manage-report", manageReportRouter);
app.use("/space", spaceRouter);

app.get("/", (req, res) => {
	res.render("index", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		faculty: testData.faculty
	});
});
app.get("/fill-request", (req, res) => {
	res.render("fill-request", {
		session: testData.session,
		user: testData.user,
		member: req.session.member
	});
});
app.get("/request-sent", (req, res) => {
	res.render("request-sent", {
		session: testData.session,
		user: testData.ser,
		member: req.session.member
	});
});
app.get("/my-request", (req, res) => {
	res.render("my-request", {
		session: testData.session,
		user: testData.user,
		member: req.session.member
	});
});
app.get("/request/:id", (req, res) => {
	res.render("single-request", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		reqInfo: testData.requestInfo,
		id: req.params.id
	});
});
app.get("/error", (req, res) => {
	res.render("error", {
		session: testData.session,
		user: testData.user,
		member: req.session.member
	});
});

// Start the server
app.listen(port, () =>
	console.log(`Listening on port ${port}\nPress Ctrl+C to stop`)
);
