const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { logAction } = require("../utils/auditLogger");
const sendEmail = require("../utils/sendEmail");

// @desc Book a new appointment (patient)
// @route POST /api/appointments
const createAppointment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const { doctorId, date, timeSlot, reason } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      date,
      timeSlot,
      reason,
    });

    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Get appointments for logged-in user (patient sees own, doctor sees own, admin sees all)
// @route GET /api/appointments
const getAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ user: req.user._id });
      filter.patient = patient?._id;
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user._id });
      filter.doctor = doctor?._id;
    }

    const appointments = await Appointment.find(filter)
      .populate({ path: "patient", populate: { path: "user", select: "name email" } })
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Doctor confirms or declines a pending appointment, with an optional message to the patient
// @route PUT /api/appointments/:id/respond
const respondToAppointment = async (req, res) => {
  try {
    const { decision, message } = req.body; // decision: "confirmed" | "rejected"

    if (!["confirmed", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'confirmed' or 'rejected'" });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (String(appointment.doctor) !== String(doctor._id)) {
      return res.status(403).json({ message: "You can only respond to your own appointments" });
    }

    appointment.status = decision;
    appointment.doctorResponse = message || "";
    appointment.respondedAt = new Date();
    await appointment.save();

    await appointment.populate({ path: "patient", populate: { path: "user", select: "name email" } });
    await appointment.populate({ path: "doctor", populate: { path: "user", select: "name" } });

    logAction({
      user: req.user,
      action: decision === "confirmed" ? "APPOINTMENT_CONFIRMED" : "APPOINTMENT_REJECTED",
      resourceId: appointment._id,
      patientId: appointment.patient?._id,
      ip: req.ip,
      details: message ? `Doctor message: ${message}` : undefined,
    });

    const patientEmail = appointment.patient?.user?.email;
    if (patientEmail) {
      const readableDate = new Date(appointment.date).toLocaleDateString();
      const subject =
        decision === "confirmed"
          ? "Your appointment has been confirmed"
          : "Your appointment request was declined";
      const html = `
        <p>Hi ${appointment.patient.user.name},</p>
        <p>Dr. ${appointment.doctor.user.name} has <strong>${decision === "confirmed" ? "confirmed" : "declined"}</strong> your appointment request for ${readableDate} at ${appointment.timeSlot}.</p>
        ${message ? `<p><em>Message from the doctor:</em> ${message}</p>` : ""}
      `;
      sendEmail({ to: patientEmail, subject, html }).catch((err) =>
        console.error("Failed to send appointment response email:", err.message)
      );
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Update appointment status generically (e.g. mark completed) — doctor/admin
// @route PUT /api/appointments/:id
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true, runValidators: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Cancel/delete appointment
// @route DELETE /api/appointments/:id
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  respondToAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};
