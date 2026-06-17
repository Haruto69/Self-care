import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
      navigate("/goals");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not create your account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Create account</span>
        <h1>Start your plan</h1>

        {error && <p className="alert">{error}</p>}

        <label className="field">
          <span>Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
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
            minLength="8"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>

        <button className="button primary full" type="submit" disabled={submitting}>
          <UserPlus size={18} />
          {submitting ? "Creating account" : "Signup"}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}

export default SignupPage;
