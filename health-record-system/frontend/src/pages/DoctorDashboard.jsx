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

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadAppointments = () => {
    api.get("/appointments").then((res) => setAppointments(res.data)).catch(() => {});
  };

  useEffect(() => { loadAppointments(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/appointments/${id}`, { status });
    loadAppointments();
  };

  const openResponseBox = (id) => {
    setOpenId(id);
    setMessage("");
    setError("");
  };

  const submitResponse = async (id, decision) => {
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/appointments/${id}/respond`, { decision, message });
      setOpenId(null);
      setMessage("");
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send response");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="label-eyebrow mb-2">Doctor overview</p>
      <h1 className="font-display text-3xl mb-8">Today's schedule</h1>

      <div className="flex gap-4 mb-10">
        <Link to="/records" className="btn-primary">Write a record</Link>
      </div>

      <div className="card divide-y divide-ink/10">
        {appointments.length === 0 && <p className="p-5 text-ink/60 text-sm">No appointments scheduled.</p>}
        {appointments.map((a) => (
          <div key={a._id} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{a.patient?.user?.name}</p>
                <p className="text-sm text-ink/60">{new Date(a.date).toLocaleDateString()} · {a.timeSlot} · {a.reason}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`label-eyebrow ${statusStyles[a.status] || ""}`}>{a.status}</span>
                {a.status === "pending" && openId !== a._id && (
                  <button onClick={() => openResponseBox(a._id)} className="btn-secondary text-sm py-1">
                    Respond
                  </button>
                )}
                {a.status === "confirmed" && (
                  <button onClick={() => updateStatus(a._id, "completed")} className="btn-secondary text-sm py-1">
                    Mark complete
                  </button>
                )}
              </div>
            </div>

            {a.doctorResponse && a.status !== "pending" && (
              <p className="text-sm text-ink/60 mt-2 italic">Your note to patient: "{a.doctorResponse}"</p>
            )}

            {openId === a._id && (
              <div className="mt-4 bg-paper border border-ink/10 rounded-md p-4">
                {error && <p className="text-alert text-sm mb-2">{error}</p>}
                <label className="text-sm font-medium block mb-1">
                  Message to patient <span className="text-ink/50 font-normal">(optional)</span>
                </label>
                <textarea
                  className="input-field mb-3"
                  rows={2}
                  placeholder="e.g. Please bring previous prescriptions, or reason for declining"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex gap-3">
                  <button
                    disabled={submitting}
                    onClick={() => submitResponse(a._id, "confirmed")}
                    className="btn-primary text-sm py-1.5 disabled:opacity-50"
                  >
                    Confirm appointment
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => submitResponse(a._id, "rejected")}
                    className="text-sm py-1.5 px-4 rounded-md border border-alert text-alert hover:bg-alert hover:text-white transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => setOpenId(null)}
                    className="text-sm py-1.5 px-4 text-ink/60 hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
