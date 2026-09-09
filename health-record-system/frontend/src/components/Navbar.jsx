import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleLabels = { patient: "Patient", doctor: "Doctor", admin: "Administrator" };

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-ink text-paper">
      <div className="vitals-strip" />
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-tight">
          Vitalis <span className="text-gold">/</span> Records
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="label-eyebrow text-sage">{roleLabels[user.role]}</span>
            <span className="text-sm">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm border border-paper/30 px-3 py-1.5 rounded-md hover:bg-paper/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
