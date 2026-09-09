const express = require("express");
const { getMyProfile, updateMyProfile, getAllDoctors } = require("../controllers/doctorController");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = express.Router();

router.get("/me", protect, authorize("doctor"), getMyProfile);
router.put("/me", protect, authorize("doctor"), updateMyProfile);
router.get("/", protect, getAllDoctors);

module.exports = router;
