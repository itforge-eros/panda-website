const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", (req, res) => {
	res.render("manage-request", {
		member: req.session.member,
		currentDept: req.session.currentDept,
	});
});
router.get("/:id", (req, res) => {
	res.render("manage-request-single", {
		member: req.session.member,
		currentDept: req.session.currentDept,
		id: req.params.id,
		reqInfo: testData.requestInfo
	});
});

module.exports = router;
