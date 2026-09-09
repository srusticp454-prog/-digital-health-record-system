const Doctor = require("../models/Doctor");

// @desc Get logged-in doctor's own profile
// @route GET /api/doctors/me
const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update logged-in doctor's own profile
// @route PUT /api/doctors/me
const updateMyProfile = async (req, res) => {
  try {
    const updates = (({ specialization, yearsOfExperience, availability }) => (
      { specialization, yearsOfExperience, availability }
    ))(req.body);

    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, updates, {
      new: true,
      runValidators: true,
    });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all doctors (public / any authenticated user)
// @route GET /api/doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("user", "name email phone");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, getAllDoctors };
