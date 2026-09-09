const MedicalRecord = require("../models/MedicalRecord");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { logAction } = require("../utils/auditLogger");

// @desc Create a medical record for a patient (doctor only)
// @route POST /api/records
const createRecord = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const { patientId, diagnosis, symptoms, prescription, followUpDate, notes } = req.body;

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: doctor._id,
      diagnosis,
      symptoms,
      prescription,
      followUpDate,
      notes,
    });

    await logAction({
      user: req.user,
      action: "CREATE_RECORD",
      resourceId: record._id,
      patientId,
      ip: req.ip,
      details: `Created record with diagnosis "${diagnosis}"`,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get records for logged-in patient (own) or a given patient (doctor/admin)
// @route GET /api/records/patient/:patientId
const getRecordsForPatient = async (req, res) => {
  try {
    let patientId = req.params.patientId;

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ user: req.user._id });
      patientId = patient?._id;
    }

    const records = await MedicalRecord.find({ patient: patientId })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ visitDate: -1 });

    await logAction({
      user: req.user,
      action: "VIEW_PATIENT_RECORDS",
      patientId,
      ip: req.ip,
      details: `Viewed ${records.length} record(s)`,
    });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get single record by id
// @route GET /api/records/:id
const getRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate({ path: "patient", populate: { path: "user", select: "name email" } })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } });
    if (!record) return res.status(404).json({ message: "Record not found" });

    await logAction({
      user: req.user,
      action: "VIEW_RECORD",
      resourceId: record._id,
      patientId: record.patient?._id,
      ip: req.ip,
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update a medical record (doctor who created it, or admin)
// @route PUT /api/records/:id
const updateRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ message: "Record not found" });

    await logAction({
      user: req.user,
      action: "UPDATE_RECORD",
      resourceId: record._id,
      patientId: record.patient,
      ip: req.ip,
    });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Upload a lab report file and attach it to a medical record (doctor only)
// @route POST /api/records/:id/upload
const uploadLabReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    const fileUrl = `/uploads/${req.file.filename}`;
    record.labReports.push({
      title: req.body.title || req.file.originalname,
      fileUrl,
    });
    await record.save();

    await logAction({
      user: req.user,
      action: "UPLOAD_LAB_REPORT",
      resourceId: record._id,
      patientId: record.patient,
      ip: req.ip,
      details: `Uploaded file "${req.file.originalname}"`,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createRecord,
  getRecordsForPatient,
  getRecordById,
  updateRecord,
  uploadLabReport,
};
