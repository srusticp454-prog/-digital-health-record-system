import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Appointments = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: "", date: "", timeSlot: "", reason: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.role === "patient") {
      api.get("/doctors").then((res) => setDoctors(res.data)).catch(() => {});
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/appointments", form);
      setMessage("Appointment booked. It is now pending confirmation.");
      setForm({ doctorId: "", date: "", timeSlot: "", reason: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="label-eyebrow mb-2">Schedule a visit</p>
      <h1 className="font-display text-3xl mb-8">Book an appointment</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {message && <p className="text-sm text-clinical">{message}</p>}
        <div>
          <label className="text-sm font-medium block mb-1">Doctor</label>
          <select name="doctorId" required className="input-field" value={form.doctorId} onChange={handleChange}>
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>Dr. {d.user?.name} — {d.specialization}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Date</label>
          <input type="date" name="date" required className="input-field" value={form.date} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Time slot</label>
          <input type="text" name="timeSlot" placeholder="e.g. 10:00 AM" required className="input-field" value={form.timeSlot} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Reason for visit</label>
          <textarea name="reason" className="input-field" rows={3} value={form.reason} onChange={handleChange} />
        </div>
        <button type="submit" className="btn-primary w-full">Book appointment</button>
      </form>
    </div>
  );
};

export default Appointments;
