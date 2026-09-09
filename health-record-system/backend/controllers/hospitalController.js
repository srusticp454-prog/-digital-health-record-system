const Hospital = require("../models/Hospital");

// @desc Get all hospitals
// @route GET /api/hospitals
const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true }).sort({ name: 1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Create a hospital (admin only)
// @route POST /api/hospitals
const createHospital = async (req, res) => {
  try {
    const { name, code, address, phone, email } = req.body;
    const hospital = await Hospital.create({ name, code, address, phone, email });
    res.status(201).json(hospital);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllHospitals, createHospital };