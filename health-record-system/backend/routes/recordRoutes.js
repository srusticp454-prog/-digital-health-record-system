const express = require("express");
const {
  createRecord,
  getRecordsForPatient,
  getRecordById,
  updateRecord,
  uploadLabReport,
} = require("../controllers/recordController");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/role");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", protect, authorize("doctor"), createRecord);
router.get("/patient/:patientId?", protect, getRecordsForPatient);
router.get("/:id", protect, getRecordById);
router.put("/:id", protect, authorize("doctor", "admin"), updateRecord);
router.post("/:id/upload", protect, authorize("doctor"), upload.single("file"), uploadLabReport);

module.exports = router;
