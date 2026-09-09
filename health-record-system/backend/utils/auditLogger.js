const AuditLog = require("../models/AuditLog");

// Fire-and-forget audit log write. Never throws or blocks the main request —
// a logging failure should never break the underlying operation.
const logAction = async ({ user, action, resourceId, patientId, ip, details }) => {
  try {
    await AuditLog.create({
      user: user._id,
      userRole: user.role,
      action,
      resourceId,
      patientId,
      ipAddress: ip,
      details,
    });
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
};

module.exports = { logAction };
