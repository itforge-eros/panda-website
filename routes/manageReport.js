const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", (req, res) => {
	res.render("manage-report", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
router.get("/:id", (req, res) => {
	res.render("manage-report-single", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept,
		id: req.params.id
	});
});

module.exports = router;
