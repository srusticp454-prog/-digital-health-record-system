require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
const MedicalRecord = require("./models/MedicalRecord");
const Hospital = require("./models/Hospital");

const run = async () => {
  await connectDB();

  console.log("Clearing existing demo data...");
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
    MedicalRecord.deleteMany({}),
    Hospital.deleteMany({}),
  ]);

  console.log("Creating demo hospitals...");
  const [hospital] = await Promise.all([
    Hospital.create({ name: "Vitalis General Hospital", code: "VGH", address: "123 Health Avenue, Bangalore", phone: "+91-80-5555-0100", email: "info@vitalis.demo" }),
  ]);

  console.log("Creating demo users...");

  const admin = await User.create({
    name: "Alex Morgan",
    email: "admin@vitalis.demo",
    password: "password123",
    role: "admin",
    hospital: hospital._id,
  });

  const doctorUser = await User.create({
    name: "Priya Nair",
    email: "doctor@vitalis.demo",
    password: "password123",
    role: "doctor",
    phone: "+91-9000000001",
    hospital: hospital._id,
  });
  const doctor = await Doctor.create({
    user: doctorUser._id,
    specialization: "General Physician",
    licenseNumber: "KA-MED-10234",
    yearsOfExperience: 8,
    availability: [{ day: "Mon", startTime: "09:00", endTime: "13:00" }],
  });

  const patientUser = await User.create({
    name: "Rahul Shetty",
    email: "patient@vitalis.demo",
    password: "password123",
    role: "patient",
    phone: "+91-9000000002",
    hospital: hospital._id,
  });
  const patient = await Patient.create({
    user: patientUser._id,
    dateOfBirth: new Date("1994-03-12"),
    gender: "male",
    bloodGroup: "O+",
    allergies: ["Penicillin"],
    chronicConditions: ["Asthma"],
    emergencyContact: { name: "Sunita Shetty", relation: "Mother", phone: "+91-9000000003" },
    address: "Sirsi, Karnataka",
    assignedDoctor: doctor._id,
  });

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor: doctor._id,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    timeSlot: "10:00 AM",
    reason: "Recurring cough and mild fever",
    status: "confirmed",
  });

  await MedicalRecord.create({
    patient: patient._id,
    doctor: doctor._id,
    diagnosis: "Seasonal bronchitis",
    symptoms: ["Cough", "Mild fever", "Fatigue"],
    prescription: [{ medicine: "Azithromycin", dosage: "500mg", duration: "3 days" }],
    notes: "Advised rest and follow-up if symptoms persist beyond 5 days.",
  });

  console.log("\nDemo data ready. Login with:");
  console.log("  Admin:   admin@vitalis.demo   / password123");
  console.log("  Doctor:  doctor@vitalis.demo  / password123");
  console.log("  Patient: patient@vitalis.demo / password123");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
