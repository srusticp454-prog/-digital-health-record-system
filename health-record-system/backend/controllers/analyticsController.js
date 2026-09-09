const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");

// @desc Get aggregated stats for the admin analytics dashboard
// @route GET /api/analytics
const getStats = async (req, res) => {
  try {
    const [totalPatients, totalDoctors, totalAppointments] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
    ]);

    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const appointmentsPerMonth = await Appointment.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const topDiagnoses = await MedicalRecord.aggregate([
      { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    res.json({
      totals: { patients: totalPatients, doctors: totalDoctors, appointments: totalAppointments },
      appointmentsByStatus: appointmentsByStatus.map((s) => ({ status: s._id, count: s.count })),
      appointmentsPerMonth: appointmentsPerMonth.map((m) => ({
        month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
        count: m.count,
      })),
      topDiagnoses: topDiagnoses.map((d) => ({ diagnosis: d._id, count: d.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats };
