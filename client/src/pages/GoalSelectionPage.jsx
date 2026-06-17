import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GoalCard from "../components/GoalCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { GOAL_DEFINITIONS } from "../data/goalQuestions.js";
import { goalService } from "../services/api.js";

function GoalSelectionPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const goals = await goalService.list();
        const activeTypes = goals.filter((goal) => goal.isActive).map((goal) => goal.goalType);
        setSelected(activeTypes);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  const toggleGoal = (goalType) => {
    setSelected((current) =>
      current.includes(goalType)
        ? current.filter((item) => item !== goalType)
        : [...current, goalType]
    );
  };

  const continueToSetup = () => {
    localStorage.setItem("pendingGoalTypes", JSON.stringify(selected));
    navigate("/setup");
  };

  if (loading) return <LoadingSpinner label="Loading goals" />;

  return (
    <section className="page-stack">
      <div className="page-header">
        <span className="eyebrow">Goal selection</span>
        <h1>Choose your focus areas</h1>
        <p>Pick one or more areas for your daily self-care rhythm.</p>
      </div>

      <div className="goal-grid">
        {Object.entries(GOAL_DEFINITIONS).map(([goalType, goal]) => (
          <GoalCard
            goal={goal}
            selected={selected.includes(goalType)}
            onToggle={() => toggleGoal(goalType)}
            key={goalType}
          />
        ))}
      </div>

      <div className="sticky-actions">
        <span>{selected.length} selected</span>
        <button className="button primary" onClick={continueToSetup} disabled={!selected.length}>
          <ArrowRight size={18} />
          Continue
        </button>
      </div>
    </section>
  );
}

export default GoalSelectionPage;
