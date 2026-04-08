const express = require("express");
const router = express.Router();
const gigController = require("../controllers/gigController");

router.get("/gigs", gigController.getAllGigs);
router.get("/gigs/:id", gigController.getGigById);

module.exports = router;
