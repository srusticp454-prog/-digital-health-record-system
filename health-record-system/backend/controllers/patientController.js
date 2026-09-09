const Patient = require("../models/Patient");

// @desc Get logged-in patient's own profile
// @route GET /api/patients/me
const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate("user", "name email phone")
      .populate({ path: "assignedDoctor", populate: { path: "user", select: "name" } });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update logged-in patient's own profile
// @route PUT /api/patients/me
const updateMyProfile = async (req, res) => {
  try {
    const updates = (({ dateOfBirth, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address }) => (
      { dateOfBirth, gender, bloodGroup, allergies, chronicConditions, emergencyContact, address }
    ))(req.body);

    const patient = await Patient.findOneAndUpdate({ user: req.user._id }, updates, {
      new: true,
      runValidators: true,
    });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all patients (doctor/admin only)
// @route GET /api/patients
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate("user", "name email phone");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get single patient by id (doctor/admin only)
// @route GET /api/patients/:id
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("user", "name email phone");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, getAllPatients, getPatientById };
