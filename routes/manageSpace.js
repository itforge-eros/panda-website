const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", (req, res) => {
		res.render("manage-space", {
		session: testData.session,
		user: testData.user
	});
});
router.get("/:id", (req, res) => {
		res.render("manage-space-single", {
		session: testData.session,
		user: testData.user
	});
});

module.exports = router;
