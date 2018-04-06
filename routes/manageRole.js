const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", function(req, res) {
		res.render("manage-role", {
		session: testData.session,
		user: testData.user
	});
});
router.get("/:id", function(req, res) {
		res.render("manage-role-single", {
		session: testData.session,
		user: testData.user
	});
});
router.get("/:id/users", function(req, res) {
		res.render("manage-role-user", {
		session: testData.session,
		user: testData.user
	});
});

module.exports = router;
