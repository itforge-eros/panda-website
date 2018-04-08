const globalVars = require("../globalVars");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const rp = require("request-promise");
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

// GET authentication methods
router.get("/", (req, res, next) => {
	// if (isLoggedIn) goToIndex(); else goToLogin();
	res.render("index", {
		session: testData.session,
		user: testData.user,
		faculty: testData.faculty
	});
});

router.get("/login", (req, res, next) => {
	res.render("login", { session: testData.session, user: testData.user });
});

router.post("/login", multer().array(), (req, res, next) => {
	let member;
	getMember(req.body.username, req.body.password)
		.then(data => {
			member = data;
		})
		.then(() => {
			console.log(member);
		});
});

/*router.get("/logout", (req, res) => {
	session.currentUser = "";
	session.authenUrl = "/login";
	res.redirect("/");
});*/

module.exports = router;
