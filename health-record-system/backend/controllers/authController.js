const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");
const generateToken = require("../utils/generateToken");

// @desc Register a new user (patient, doctor, or admin)
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, licenseNumber, hospital } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const userData = { name, email, password, role: role || "patient", phone };
    if (hospital && hospital !== "") userData.hospital = hospital;

    const user = await User.create(userData);

    if (user.role === "patient") {
      await Patient.create({ user: user._id });
    } else if (user.role === "doctor") {
      if (!specialization || !licenseNumber) {
        return res.status(400).json({ message: "Doctor requires specialization and licenseNumber" });
      }
      await Doctor.create({ user: user._id, specialization, licenseNumber });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get logged-in user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
