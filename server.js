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
let session = {
	env: env,
	currentUser: "",
	authenUrl: "logout"
};
let user = { isAdmin: true, isApprover: true };
let faculty = [
	{ name: "คณะเทคโนโลยีสารสนเทศ", slug: "fac-it" },
	{ name: "คณะเทคโนโลยีการเกษตร", slug: "fac-agro" },
	{ name: "คณะสถาปัตยกรรมศาสตร์", slug: "fac-arch" },
	{ name: "คณะวิทยาศาสตร์", slug: "fac-sci" }
];
let requestInfo = [
	{ name: "ผู้จอง", data: "นาย สมศรี ชาวไร่" },
	{ name: "ยื่นคำร้องเมื่อ", data: "28 กุมภาพันธ์ 2561"},
	{ name: "วันที่ต้องการจอง", data: "30 กุมภาพันธ์ 2561"},
	{ name: "เวลาที่ต้องการจอง", data: "10.00 - 12.00"},
	{ name: "จำนวนที่นั่ง", data: "50"},
	{ name: "เหตุผล", data: "อย่าอยากรู้ให้มากได้ปะ"},
];

// Routes
app.get("/", function(req, res) {
	res.render("index", { session: session, user: user, faculty: faculty });
});
app.get("/login", function(req, res) {
	session.currentUser = "Nathan";
	session.authenUrl = "/logout";
	res.redirect("/");
});
app.get("/logout", function(req, res) {
	session.currentUser = "";
	session.authenUrl = "/login";
	res.redirect("/");
});
app.get("/single", function(req, res) {
	res.render("single-space", {
		session: session,
		user: user,
		faculty: faculty
	});
});
app.get("/fill-request", function(req, res) {
	res.render("fill-request", {
		session: session,
		user: user,
		faculty: faculty
	});
});
app.get("/request-sent", function(req, res) {
	res.render("request-sent", {
		session: session,
		user: user,
		faculty: faculty
	});
});
app.get("/my-request", function(req, res) {
	res.render("my-request", {
		session: session,
		user: user,
		faculty: faculty
	});
});
app.get("/request/:id", function(req, res) {
	res.render("single-request", {
		session: session,
		user: user,
		id: req.params.id,
		reqInfo: requestInfo
	});
});
app.get("/manage-request", function(req, res) {
		res.render("manage-request", {
		session: session,
		user: user,
		faculty: faculty
	});
});
app.get("/manage-request/:id", function(req, res) {
		res.render("manage-request-single", {
		session: session,
		user: user,
		id: req.params.id,
		reqInfo: requestInfo
	});
});
app.get("/manage-role", function(req, res) {
		res.render("manage-role", {
		session: session,
		user: user
	});
});
app.get("/manage-role/:id", function(req, res) {
		res.render("manage-role-single", {
		session: session,
		user: user
	});
});
app.get("/manage-role/:id/users", function(req, res) {
		res.render("manage-role-user", {
		session: session,
		user: user
	});
});

// Start the server
app.listen(port, () =>
	console.log("Listening on port 3000\nPress Ctrl+C to stop")
);
