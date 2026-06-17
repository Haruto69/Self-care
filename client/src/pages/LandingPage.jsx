import { ArrowRight, CheckCircle2, Leaf, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

function LandingPage() {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <section className="landing">
      <div className="landing-copy">
        <span className="eyebrow">Personal improvement</span>
        <h1>Self-care</h1>
        <p>
          Choose the goals that matter this season, answer a short setup, and get a daily
          rhythm for body, skin, and focus.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="button primary">
            <Sparkles size={18} />
            Start today
          </Link>
          <Link to="/login" className="button secondary">
            <ArrowRight size={18} />
            Login
          </Link>
        </div>
      </div>

      <div className="landing-preview" aria-label="Self-care dashboard preview">
        <div className="preview-panel">
          <div className="preview-head">
            <span className="brand-mark">
              <Leaf size={18} />
            </span>
            <span>Today</span>
          </div>
          <div className="preview-meter">
            <strong>68%</strong>
            <span>complete</span>
          </div>
          <div className="preview-list">
            <span>
              <CheckCircle2 size={17} />
              Complete focus sessions
            </span>
            <span>
              <CheckCircle2 size={17} />
              Apply sunscreen
            </span>
            <span>Drink water target</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
