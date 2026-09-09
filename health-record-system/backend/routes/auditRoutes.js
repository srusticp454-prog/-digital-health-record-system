const express = require("express");
const { getAuditLogs } = require("../controllers/auditController");
const { protect } = require("../middleware/auth");
const authorize = require("../middleware/role");

const router = express.Router();

router.get("/", protect, authorize("admin"), getAuditLogs);

module.exports = router;
