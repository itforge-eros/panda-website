const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", (req, res) => {
	res.render("my-request", {
		session: testData.session,
		user: testData.user,
		member: req.session.member
	});
});
router.get("/:id", (req, res) => {
	res.render("single-request", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		reqInfo: testData.requestInfo,
		id: req.params.id
	});
});

module.exports = router;
