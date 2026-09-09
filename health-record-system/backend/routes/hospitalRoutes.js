const express = require("express");
const { getAllHospitals, createHospital } = require("../controllers/hospitalController");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = express.Router();

router.get("/", protect, getAllHospitals);
router.post("/", protect, authorize("admin"), createHospital);

module.exports = router;