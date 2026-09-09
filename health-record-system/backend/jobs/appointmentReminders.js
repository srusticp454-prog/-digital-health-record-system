const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/sendEmail");

const REMINDER_WINDOW_HOURS = 24;

const buildReminderEmail = (appointment) => {
  const patientName = appointment.patient?.user?.name || "there";
  const doctorName = appointment.doctor?.user?.name || "your doctor";
  const dateStr = new Date(appointment.date).toLocaleDateString();

  return {
    subject: `Reminder: appointment with Dr. ${doctorName} tomorrow`,
    html: `
      <p>Hi ${patientName},</p>
      <p>This is a reminder that you have an appointment with <strong>Dr. ${doctorName}</strong>
      on <strong>${dateStr}</strong> at <strong>${appointment.timeSlot}</strong>.</p>
      <p>Reason: ${appointment.reason || "General consultation"}</p>
      <p>— Vitalis Health Record System</p>
    `,
  };
};

// Finds confirmed appointments happening within the next 24 hours that
// haven't had a reminder sent yet, emails the patient, and flags them.
const runReminderSweep = async () => {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const dueAppointments = await Appointment.find({
    status: "confirmed",
    reminderSent: false,
    date: { $gte: now, $lte: windowEnd },
  })
    .populate({ path: "patient", populate: { path: "user", select: "name email" } })
    .populate({ path: "doctor", populate: { path: "user", select: "name" } });

  for (const appointment of dueAppointments) {
    const patientEmail = appointment.patient?.user?.email;
    if (!patientEmail) continue;

    const { subject, html } = buildReminderEmail(appointment);
    try {
      await sendEmail({ to: patientEmail, subject, html });
      appointment.reminderSent = true;
      await appointment.save();
    } catch (err) {
      console.error(`Failed to send reminder for appointment ${appointment._id}:`, err.message);
    }
  }

  if (dueAppointments.length > 0) {
    console.log(`Appointment reminders: sent ${dueAppointments.length} email(s).`);
  }
};

// Schedules the sweep to run once every hour. Also runs once at startup.
const startReminderJob = () => {
  cron.schedule("0 * * * *", () => {
    runReminderSweep().catch((err) => console.error("Reminder sweep failed:", err.message));
  });
  runReminderSweep().catch((err) => console.error("Initial reminder sweep failed:", err.message));
};

module.exports = { startReminderJob, runReminderSweep };
