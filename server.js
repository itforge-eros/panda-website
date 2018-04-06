const express = require("express");
const app = express();
const env = process.env.NODE_ENV || "dev";
const port = env == "production" ? 80 : 3000;

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

app.get("/", function(req, res) {
	res.render("index", { session: testData.session, user: testData.user, faculty: testData.faculty });
});

app.use("/authen", authenRouter);

app.get("/single", function(req, res) {
	res.render("single-space", {
		session: testData.session,
		user: testData.user,
		faculty: testData.faculty
	});
});
app.get("/fill-request", function(req, res) {
	res.render("fill-request", {
		session: testData.session,
		user: testData.user,
		faculty: testData.faculty
	});
});
app.get("/request-sent", function(req, res) {
	res.render("request-sent", {
		session: testData.session,
		user: testData.ser,
		faculty: testData.faculty
	});
});
app.get("/my-request", function(req, res) {
	res.render("my-request", {
		session: testData.session,
		user: testData.user,
		faculty: testData.faculty
	});
});
app.get("/request/:id", function(req, res) {
	res.render("single-request", {
		session: testData.session,
		user: testData.user,
		id: req.params.id,
		reqInfo: testData.requestInfo
	});
});
app.get("/manage-request", function(req, res) {
		res.render("manage-request", {
		session: testData.session,
		user: testData.user,
		faculty: testData.faculty
	});
});
app.get("/manage-request/:id", function(req, res) {
		res.render("manage-request-single", {
		session: testData.session,
		user: testData.user,
		id: req.params.id,
		reqInfo: testData.requestInfo
	});
});
app.get("/manage-role", function(req, res) {
		res.render("manage-role", {
		session: testData.session,
		user: testData.user
	});
});
app.get("/manage-role/:id", function(req, res) {
		res.render("manage-role-single", {
		session: testData.session,
		user: testData.user
	});
});
app.get("/manage-role/:id/users", function(req, res) {
		res.render("manage-role-user", {
		session: testData.session,
		user: testData.user
	});
});
app.get("/manage-space", function(req, res) {
		res.render("manage-space", {
		session: testData.session,
		user: testData.user
	});
});
app.get("/manage-space/:id", function(req, res) {
		res.render("manage-space-single", {
		session: testData.session,
		user: testData.user
	});
});
app.get("/manage-report", function(req, res) {
		res.render("manage-report", {
		session: testData.session,
		user: testData.user
	});
});
app.get("/manage-report/:id", function(req, res) {
		res.render("manage-report-single", {
		session: testData.session,
		user: testData.user,
		id: req.params.id
	});
});


// Start the server
app.listen(port, () =>
	console.log("Listening on port 3000\nPress Ctrl+C to stop")
);
