const express = require("express");
const router = express.Router();
const testData = require("../models/testData");

const bodyParser = require("body-parser");
const multer = require("multer");

const amenities = [
	{ id: "PROJECTOR", name: "โปรเจ็กเตอร์" },
	{ id: "AIR_CONDITIONER", name: "แอร์" },
	{ id: "SPEAKER", name: "ระบบเสียง" },
	{ id: "INSTRUCTOR_PC", name: "คอมฯ ผู้สอน" }
];

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

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
router.post(/\/.*\/save/, multer().array(), (req, res) => {
	res.redirect("/manage-space")
});
router.get("/new", (req, res) => {
	res.render("manage-space-single", {
		session: testData.session,
		user: testData.user,
		member: req.session.member,
		amenities: amenities
	});
});

module.exports = router;
