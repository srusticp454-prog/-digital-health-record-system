const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String, required: true },
    action: {
      type: String,
      enum: ["VIEW_RECORD", "CREATE_RECORD", "UPDATE_RECORD", "VIEW_PATIENT_RECORDS", "UPLOAD_LAB_REPORT"],
      required: true,
    },
    resourceType: { type: String, default: "MedicalRecord" },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    ipAddress: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
