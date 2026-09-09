import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

const statusStyles = {
  pending: "text-gold",
  confirmed: "text-clinical",
  completed: "text-ink/60",
  rejected: "text-alert",
  cancelled: "text-alert",
};

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get("/patients/me").then((res) => setProfile(res.data)).catch(() => {});
    api.get("/appointments").then((res) => setAppointments(res.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="label-eyebrow mb-2">Patient overview</p>
      <h1 className="font-display text-3xl mb-8">Welcome back{profile ? `, ${profile.user?.name}` : ""}</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="card p-5">
          <p className="label-eyebrow mb-1">Blood group</p>
          <p className="text-2xl font-display">{profile?.bloodGroup || "—"}</p>
        </div>
        <div className="card p-5">
          <p className="label-eyebrow mb-1">Assigned doctor</p>
          <p className="text-2xl font-display">{profile?.assignedDoctor?.user?.name || "Unassigned"}</p>
        </div>
        <div className="card p-5">
          <p className="label-eyebrow mb-1">Upcoming visits</p>
          <p className="text-2xl font-display">{appointments.filter((a) => a.status !== "completed" && a.status !== "cancelled").length}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-10">
        <Link to="/appointments" className="btn-primary">Book appointment</Link>
        <Link to="/records" className="btn-secondary">View medical records</Link>
        <Link to="/profile" className="btn-secondary">Edit profile</Link>
      </div>

      <h2 className="font-display text-xl mb-4">Recent appointments</h2>
      <div className="card divide-y divide-ink/10">
        {appointments.length === 0 && <p className="p-5 text-ink/60 text-sm">No appointments yet.</p>}
        {appointments.slice(0, 5).map((a) => (
          <div key={a._id} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dr. {a.doctor?.user?.name}</p>
                <p className="text-sm text-ink/60">{new Date(a.date).toLocaleDateString()} · {a.timeSlot}</p>
              </div>
              <span className={`label-eyebrow ${statusStyles[a.status] || ""}`}>{a.status}</span>
            </div>
            {a.doctorResponse && (
              <p className="text-sm text-ink/60 mt-2 italic">Doctor's note: "{a.doctorResponse}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientDashboard;
