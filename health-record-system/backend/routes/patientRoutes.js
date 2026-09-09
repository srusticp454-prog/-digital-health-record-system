const express = require("express");
const {
  getMyProfile,
  updateMyProfile,
  getAllPatients,
  getPatientById,
} = require("../controllers/patientController");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = express.Router();

router.get("/me", protect, authorize("patient"), getMyProfile);
router.put("/me", protect, authorize("patient"), updateMyProfile);
router.get("/", protect, authorize("doctor", "admin"), getAllPatients);
router.get("/:id", protect, authorize("doctor", "admin"), getPatientById);

module.exports = router;
