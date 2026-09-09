import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    specialization: "",
    licenseNumber: "",
    hospital: "",
  });
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/hospitals").then((res) => setHospitals(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <p className="label-eyebrow mb-2">Open a new chart</p>
        <h1 className="font-display text-3xl mb-6">Create your account</h1>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && <p className="text-alert text-sm">{error}</p>}
          <div>
            <label className="text-sm font-medium block mb-1">Full name</label>
            <input name="name" required className="input-field" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input type="email" name="email" required className="input-field" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Password</label>
            <input type="password" name="password" required minLength={6} className="input-field" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">I am a</label>
            <select name="role" className="input-field" value={form.role} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Hospital</label>
            <select name="hospital" className="input-field" value={form.hospital} onChange={handleChange}>
              <option value="">Select hospital</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>{h.name}</option>
              ))}
            </select>
          </div>
          {form.role === "doctor" && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1">Specialization</label>
                <input name="specialization" required className="input-field" value={form.specialization} onChange={handleChange} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">License number</label>
                <input name="licenseNumber" required className="input-field" value={form.licenseNumber} onChange={handleChange} />
              </div>
            </>
          )}
          <button type="submit" className="btn-primary w-full">
            Create account
          </button>
        </form>
        <p className="text-sm mt-4 text-ink/70">
          Already registered? <Link to="/login" className="text-clinical font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
