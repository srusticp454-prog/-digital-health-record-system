const express = require("express");
const { getStats } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = express.Router();

router.get("/", protect, authorize("admin"), getStats);

module.exports = router;
