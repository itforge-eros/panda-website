const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const rp = require("request-promise");
const session = require("express-session");
const testData = require("../models/testData");

const getMember = (usr, pwd) => {
	return rp({
		method: "POST",
		uri: globalVars.loginURL,
		json: true,
		body: {
			username: usr,
			password: pwd
		}
	});
};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true
	})
);

// GET authentication methods
router.get("/", (req, res, next) => {
	res.redirect("/");
});

router.get("/login", (req, res, next) => {
	res.render("login", { session: testData.session, user: testData.user, member: req.session.member });
});

router.post("/login", multer().array(), (req, res, next) => {
	getMember(req.body.username, req.body.password).then(data => {
		req.session.token = data.data.token;
		req.session.member = data.data.member;
		res.redirect("/");
	});
});

/*router.get("/logout", (req, res) => {
	session.currentUser = "";
	session.authenUrl = "/login";
	res.redirect("/");
});*/

module.exports = router;
