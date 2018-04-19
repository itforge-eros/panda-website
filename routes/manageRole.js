const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", (req, res) => {
		res.render("manage-role", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
router.get("/:id", (req, res) => {
		res.render("manage-role-single", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
router.get("/:id/users", (req, res) => {
		res.render("manage-role-user", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});

module.exports = router;
