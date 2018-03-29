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

// Routes
app.get("/", function(req, res) {
	res.render("index", { session: session, user: user, faculty: faculty });
});
app.get("/login", function(req, res) {
	session.currentUser = "Nathan";
	session.authenUrl = "logout";
	res.redirect("/");
});
app.get("/logout", function(req, res) {
	session.currentUser = "";
	session.authenUrl = "login";
	res.redirect("/");
});
app.get("/single", function(req, res) {
	res.render("single-space", { session: session, user: user, faculty: faculty });
});
app.get("/fill-request", function(req, res) {
	res.render("fill-request", { session: session, user: user, faculty: faculty });
});

// Start the server
app.listen(port, () =>
	console.log("Listening on port 3000\nPress Ctrl+C to stop")
);
