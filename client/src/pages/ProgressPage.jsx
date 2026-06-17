import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ProgressSummary from "../components/ProgressSummary.jsx";
import { checkInService } from "../services/api.js";

function ProgressPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await checkInService.summary();
        setSummary(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Could not load progress");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) return <LoadingSpinner label="Loading progress" />;

  return (
    <section className="page-stack">
      <div className="page-header">
        <span className="eyebrow">Progress</span>
        <h1>Simple summaries</h1>
        <p>Completion totals by goal, based on generated tasks.</p>
      </div>

      {error && <p className="alert">{error}</p>}

      {summary?.totalTasks ? (
        <>
          <div className="metrics-row">
            <article>
              <BarChart3 size={20} />
              <strong>{summary.completionRate}%</strong>
              <span>overall completion</span>
            </article>
            <article>
              <strong>{summary.activeGoals}</strong>
              <span>active goals</span>
            </article>
            <article>
              <strong>{summary.completedTasks}</strong>
              <span>tasks completed</span>
            </article>
          </div>

          <div className="summary-grid">
            {summary.byGoal.map((item) => (
              <ProgressSummary item={item} key={item.goalId} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span className="eyebrow">No progress yet</span>
          <h2>Complete a few tasks first</h2>
          <p>Your summaries appear after tasks are generated and checked off.</p>
          <Link to="/dashboard" className="button primary">
            Go to dashboard
          </Link>
        </div>
      )}
    </section>
  );
}

export default ProgressPage;
