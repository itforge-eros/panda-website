const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", (req, res) => {
		res.render("manage-request", {
		session: testData.session,
		user: testData.user,
		faculty: testData.faculty
	});
});
router.get("/:id", (req, res) => {
		res.render("manage-request-single", {
		session: testData.session,
		user: testData.user,
		id: req.params.id,
		reqInfo: testData.requestInfo
	});
});

module.exports = router;
