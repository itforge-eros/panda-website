const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

// GET authentication methods
router.get('/', (req, res, next) => {
	// if (isLoggedIn) goToIndex(); else goToLogin();
	res.render('index', { session: testData.session, user: testData.user, faculty: testData.faculty });
});
router.get("/login", (req, res, next) => {
	res.render("login", { session: testData.session, user: testData.user });
});
/*router.get("/logout", (req, res) => {
	session.currentUser = "";
	session.authenUrl = "/login";
	res.redirect("/");
});*/

module.exports = router;
