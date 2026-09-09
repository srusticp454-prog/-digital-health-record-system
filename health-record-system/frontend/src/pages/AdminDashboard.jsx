import { useEffect, useState } from "react";
import api from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const STATUS_COLORS = {
  pending: "#B9862E",
  confirmed: "#1C7C72",
  completed: "#16302E",
  cancelled: "#C1443B",
};

const AdminDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/patients").then((res) => setPatients(res.data)).catch(() => {});
    api.get("/doctors").then((res) => setDoctors(res.data)).catch(() => {});
    api.get("/analytics").then((res) => setStats(res.data)).catch(() => {});
    api.get("/audit?limit=10").then((res) => setLogs(res.data.logs)).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <p className="label-eyebrow mb-2">System overview</p>
      <h1 className="font-display text-3xl mb-8">Administration</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="card p-5">
          <p className="label-eyebrow mb-1">Total patients</p>
          <p className="text-3xl font-display">{stats?.totals.patients ?? patients.length}</p>
        </div>
        <div className="card p-5">
          <p className="label-eyebrow mb-1">Total doctors</p>
          <p className="text-3xl font-display">{stats?.totals.doctors ?? doctors.length}</p>
        </div>
        <div className="card p-5">
          <p className="label-eyebrow mb-1">Total appointments</p>
          <p className="text-3xl font-display">{stats?.totals.appointments ?? 0}</p>
        </div>
      </div>

      {stats && (
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="card p-5">
            <p className="label-eyebrow mb-4">Appointments by status</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.appointmentsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                >
                  {stats.appointmentsByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#8FB9A8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <p className="label-eyebrow mb-4">Appointments over time</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.appointmentsPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16302E22" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1C7C72" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5 md:col-span-2">
            <p className="label-eyebrow mb-4">Top diagnoses</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.topDiagnoses} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16302E22" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="diagnosis" tick={{ fontSize: 12 }} width={140} />
                <Tooltip />
                <Bar dataKey="count" fill="#B9862E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-xl mb-4">Patients</h2>
          <div className="card divide-y divide-ink/10">
            {patients.map((p) => (
              <div key={p._id} className="p-4 flex justify-between">
                <span>{p.user?.name}</span>
                <span className="text-ink/60 text-sm">{p.user?.email}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl mb-4">Doctors</h2>
          <div className="card divide-y divide-ink/10">
            {doctors.map((d) => (
              <div key={d._id} className="p-4 flex justify-between">
                <span>Dr. {d.user?.name}</span>
                <span className="text-ink/60 text-sm">{d.specialization}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="font-display text-xl mb-4 mt-10">Recent audit activity</h2>
      <div className="card divide-y divide-ink/10">
        {logs.length === 0 && <p className="p-5 text-ink/60 text-sm">No audit activity yet.</p>}
        {logs.map((log) => (
          <div key={log._id} className="p-4 flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{log.user?.name || "Unknown user"}</span>
              <span className="text-ink/60"> ({log.userRole}) — {log.action.replace(/_/g, " ").toLowerCase()}</span>
            </div>
            <span className="text-ink/50 font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
