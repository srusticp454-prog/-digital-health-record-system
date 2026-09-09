const express = require("express");
const {
  createAppointment,
  getAppointments,
  respondToAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = express.Router();

router.post("/", protect, authorize("patient"), createAppointment);
router.get("/", protect, getAppointments);
router.put("/:id/respond", protect, authorize("doctor"), respondToAppointment);
router.put("/:id", protect, authorize("doctor", "admin"), updateAppointmentStatus);
router.delete("/:id", protect, deleteAppointment);

module.exports = router;
