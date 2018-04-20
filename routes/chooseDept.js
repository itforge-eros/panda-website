const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

router.get("/", (req, res) => {
	res.render("choose-dept", {
		session: req.session,
		user: testData.user,
		member: req.session.member,
		currentDept: req.session.currentDept
	});
});
router.get("/:dept/:id", (req, res) => {
	req.session.currentDept = {name: req.params.dept, id: req.params.id};
	res.redirect("/");
});

module.exports = router
