const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/:id", (req, res) => {
	res.render("single-space", {
		session: testData.session,
		user: testData.user,
		faculty: testData.faculty
	});
});

module.exports = router;
