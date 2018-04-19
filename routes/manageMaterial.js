const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", (req, res) => {
	res.render("manage-material", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});

module.exports = router;
