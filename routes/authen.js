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
		name: "kmitl_osrs",
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: true
	})
);

let isCredEmpty = false;

// GET authentication methods
router.get("/", (req, res, next) => {
	res.redirect("/");
});

router.get("/login", (req, res, next) => {
	res.render("login", { session: testData.session, user: testData.user, member: req.session.member, isCredEmpty: isCredEmpty });
	isCredEmpty = false; // reset so that refreshing the page doesn't display error
});

router.post("/login", multer().array(), (req, res, next) => {
	if (req.body.username == "" || req.body.password == "") {
		isCredEmpty = true;
		res.redirect("/authen/login");
	} else {
		getMember(req.body.username, req.body.password).then(data => {
			req.session.token = data.data.token;
			req.session.member = data.data.member;
			res.redirect("/");
		});
	}
});

router.get("/logout", (req, res) => {
	req.session.token = null;
	req.session.member = null;
	res.redirect("/");
});

module.exports = router;
