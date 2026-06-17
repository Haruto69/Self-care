import { LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { goalService } from "../services/api.js";

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleLogout = () => {
    setError("");
    setMessage("");

    try {
      logout();
      navigate("/");
    } catch (logoutError) {
      setError("Could not log you out. Please try again.");
    }
  };

  const resetData = async () => {
    const confirmed = window.confirm("Reset all goals, tasks, and check-ins for this account?");

    if (!confirmed) return;

    setResetting(true);
    setMessage("");
    setError("");

    try {
      const goals = await goalService.list();
      await Promise.all(goals.map((goal) => goalService.remove(goal._id)));
      localStorage.removeItem("pendingGoalTypes");
      setMessage("Your goals and generated task history have been reset.");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not reset your data. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <section className="profile-layout">
      <div className="page-header">
        <span className="eyebrow">Settings</span>
        <h1>Profile</h1>
        <p>Manage your account session and goal data.</p>
      </div>

      <article className="settings-panel">
        <div>
          <span className="eyebrow">Account</span>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
        <button className="button secondary" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </article>

      <article className="settings-panel danger">
        <div>
          <span className="eyebrow">Reset</span>
          <h2>Clear goal data</h2>
          <p>Removes your goals, generated tasks, and check-ins.</p>
        </div>
        <button className="button danger" onClick={resetData} disabled={resetting}>
          <Trash2 size={18} />
          {resetting ? "Resetting" : "Reset data"}
        </button>
      </article>

      {error && <p className="alert">{error}</p>}
      {message && <p className="notice">{message}</p>}
    </section>
  );
}

export default ProfilePage;
