import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import SetupForm from "../components/SetupForm.jsx";
import { GOAL_QUESTIONS } from "../data/goalQuestions.js";
import { goalService, taskService } from "../services/api.js";

const readPendingGoals = () => {
  try {
    return JSON.parse(localStorage.getItem("pendingGoalTypes") || "[]");
  } catch (error) {
    return [];
  }
};

const buildInitialAnswers = (goalTypes) => {
  return goalTypes.reduce((result, goalType) => {
    result[goalType] = (GOAL_QUESTIONS[goalType] || []).reduce((answers, question) => {
      answers[question.name] = question.type === "multi" ? [] : "";
      return answers;
    }, {});
    return result;
  }, {});
};

function GoalSetupPage() {
  const navigate = useNavigate();
  const selectedGoalTypes = useMemo(readPendingGoals, []);
  const [answers, setAnswers] = useState(() => buildInitialAnswers(selectedGoalTypes));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateAnswers = (goalType, nextAnswers) => {
    setAnswers((current) => ({ ...current, [goalType]: nextAnswers }));
  };

  const saveSetup = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const existingGoals = await goalService.list();

      for (const goalType of selectedGoalTypes) {
        const existing = existingGoals.find((goal) => goal.goalType === goalType && goal.isActive);
        const payload = { goalType, selectedOptions: answers[goalType], isActive: true };

        if (existing) {
          await goalService.update(existing._id, payload);
        } else {
          await goalService.create(payload);
        }
      }

      await taskService.generate();
      localStorage.removeItem("pendingGoalTypes");
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not save your setup");
    } finally {
      setSaving(false);
    }
  };

  if (saving) return <LoadingSpinner label="Building today's tasks" />;

  if (!selectedGoalTypes.length) {
    return (
      <section className="empty-state">
        <span className="eyebrow">Setup</span>
        <h1>No goals selected</h1>
        <p>Choose at least one goal before filling out your setup.</p>
        <Link to="/goals" className="button primary">
          Select goals
        </Link>
      </section>
    );
  }

  return (
    <form className="page-stack" onSubmit={saveSetup}>
      <div className="page-header">
        <span className="eyebrow">Goal setup</span>
        <h1>Shape your daily plan</h1>
        <p>Your answers decide which tasks are generated each day.</p>
      </div>

      {error && <p className="alert">{error}</p>}

      {selectedGoalTypes.map((goalType) => (
        <SetupForm
          goalType={goalType}
          answers={answers[goalType] || {}}
          onChange={updateAnswers}
          key={goalType}
        />
      ))}

      <div className="sticky-actions">
        <span>{selectedGoalTypes.length} setup section{selectedGoalTypes.length > 1 ? "s" : ""}</span>
        <button className="button primary" type="submit">
          <Save size={18} />
          Save setup
        </button>
      </div>
    </form>
  );
}

export default GoalSetupPage;
