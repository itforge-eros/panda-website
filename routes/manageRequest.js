const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", function(req, res) {
		res.render("manage-request", {
		session: testData.session,
		user: testData.user,
		faculty: testData.faculty
	});
});
router.get("/:id", function(req, res) {
		res.render("manage-request-single", {
		session: testData.session,
		user: testData.user,
		id: req.params.id,
		reqInfo: testData.requestInfo
	});
});

module.exports = router;
