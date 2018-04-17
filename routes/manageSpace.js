const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

const amenities = [
	{ id: "proj", name: "โปรเจ็กเตอร์" },
	{ id: "aircon", name: "แอร์" },
	{ id: "sound", name: "ระบบเสียง" },
	{ id: "pc", name: "คอมฯ ผู้สอน" }
];

router.get("/", (req, res) => {
	res.render("manage-space", {
		session: testData.session,
		user: testData.user,
		member: req.session.member
	});
});
router.get("/:id", (req, res) => {
	res.render("manage-space-single", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		amenities: amenities
	});
});

module.exports = router;
