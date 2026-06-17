import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/dashboard");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not log you in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Welcome back</span>
        <h1>Login</h1>

        {error && <p className="alert">{error}</p>}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>

        <button className="button primary full" type="submit" disabled={submitting}>
          <LogIn size={18} />
          {submitting ? "Logging in" : "Login"}
        </button>
        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </section>
  );
}

export default LoginPage;
