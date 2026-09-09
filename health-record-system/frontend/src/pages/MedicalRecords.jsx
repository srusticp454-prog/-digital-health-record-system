import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const MedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: "", diagnosis: "", symptoms: "", notes: "" });
  const [message, setMessage] = useState("");
  const [uploadState, setUploadState] = useState({}); // { [recordId]: { file, uploading, message } }

  const loadRecords = () => {
    api.get("/records/patient").then((res) => setRecords(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadRecords();
    if (user?.role === "doctor") {
      api.get("/patients").then((res) => setPatients(res.data)).catch(() => {});
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/records", {
        ...form,
        symptoms: form.symptoms.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setMessage("Record saved.");
      setForm({ patientId: "", diagnosis: "", symptoms: "", notes: "" });
      loadRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save record");
    }
  };

  const handleFileChange = (recordId, file) => {
    setUploadState((prev) => ({ ...prev, [recordId]: { ...prev[recordId], file, message: "" } }));
  };

  const handleUpload = async (recordId) => {
    const entry = uploadState[recordId];
    if (!entry?.file) return;

    setUploadState((prev) => ({ ...prev, [recordId]: { ...prev[recordId], uploading: true } }));

    const formData = new FormData();
    formData.append("file", entry.file);
    formData.append("title", entry.file.name);

    try {
      await api.post(`/records/${recordId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadState((prev) => ({ ...prev, [recordId]: { file: null, uploading: false, message: "Uploaded." } }));
      loadRecords();
    } catch (err) {
      setUploadState((prev) => ({
        ...prev,
        [recordId]: { ...prev[recordId], uploading: false, message: err.response?.data?.message || "Upload failed" },
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <p className="label-eyebrow mb-2">Chart history</p>
      <h1 className="font-display text-3xl mb-8">Medical records</h1>

      {user?.role === "doctor" && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4 mb-10">
          <h2 className="font-display text-lg">New record entry</h2>
          {message && <p className="text-sm text-clinical">{message}</p>}
          <div>
            <label className="text-sm font-medium block mb-1">Patient</label>
            <select name="patientId" required className="input-field" value={form.patientId} onChange={handleChange}>
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>{p.user?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Diagnosis</label>
            <input name="diagnosis" required className="input-field" value={form.diagnosis} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Symptoms (comma separated)</label>
            <input name="symptoms" className="input-field" value={form.symptoms} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Notes</label>
            <textarea name="notes" rows={3} className="input-field" value={form.notes} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary">Save record</button>
        </form>
      )}

      <div className="card divide-y divide-ink/10">
        {records.length === 0 && <p className="p-5 text-ink/60 text-sm">No records found.</p>}
        {records.map((r) => (
          <div key={r._id} className="p-5">
            <div className="flex justify-between items-start mb-2">
              <p className="font-medium">{r.diagnosis}</p>
              <span className="label-eyebrow">{new Date(r.visitDate).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-ink/70">Dr. {r.doctor?.user?.name}</p>
            {r.symptoms?.length > 0 && (
              <p className="text-sm text-ink/60 mt-1">Symptoms: {r.symptoms.join(", ")}</p>
            )}
            {r.notes && <p className="text-sm text-ink/60 mt-1">{r.notes}</p>}

            {r.labReports?.length > 0 && (
              <div className="mt-3">
                <p className="label-eyebrow mb-1">Lab reports</p>
                <ul className="space-y-1">
                  {r.labReports.map((report, i) => (
                    <li key={i}>
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-clinical text-sm underline"
                      >
                        {report.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {user?.role === "doctor" && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(r._id, e.target.files[0])}
                  className="text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleUpload(r._id)}
                  disabled={!uploadState[r._id]?.file || uploadState[r._id]?.uploading}
                  className="btn-secondary text-sm py-1 disabled:opacity-40"
                >
                  {uploadState[r._id]?.uploading ? "Uploading..." : "Attach lab report"}
                </button>
                {uploadState[r._id]?.message && (
                  <span className="text-xs text-ink/60">{uploadState[r._id].message}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecords;
