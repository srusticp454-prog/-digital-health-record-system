import { useEffect, useState } from "react";
import api from "../services/api";

const PatientProfile = () => {
  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    allergies: "",
    chronicConditions: "",
    address: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/patients/me").then((res) => {
      const p = res.data;
      setForm({
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : "",
        gender: p.gender || "",
        bloodGroup: p.bloodGroup || "",
        allergies: (p.allergies || []).join(", "),
        chronicConditions: (p.chronicConditions || []).join(", "),
        address: p.address || "",
      });
    }).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.put("/patients/me", {
        ...form,
        allergies: form.allergies.split(",").map((s) => s.trim()).filter(Boolean),
        chronicConditions: form.chronicConditions.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="label-eyebrow mb-2">Personal details</p>
      <h1 className="font-display text-3xl mb-8">Your health profile</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {message && <p className="text-sm text-clinical">{message}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Date of birth</label>
            <input type="date" name="dateOfBirth" className="input-field" value={form.dateOfBirth} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Gender</label>
            <select name="gender" className="input-field" value={form.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Blood group</label>
          <input name="bloodGroup" placeholder="e.g. O+" className="input-field" value={form.bloodGroup} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Allergies (comma separated)</label>
          <input name="allergies" className="input-field" value={form.allergies} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Chronic conditions (comma separated)</label>
          <input name="chronicConditions" className="input-field" value={form.chronicConditions} onChange={handleChange} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Address</label>
          <textarea name="address" rows={2} className="input-field" value={form.address} onChange={handleChange} />
        </div>
        <button type="submit" className="btn-primary">Save profile</button>
      </form>
    </div>
  );
};

export default PatientProfile;
