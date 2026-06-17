import { CheckCircle2 } from "lucide-react";

function GoalCard({ goal, selected, onToggle }) {
  return (
    <button
      type="button"
      className={`goal-card accent-${goal.accent} ${selected ? "selected" : ""}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      <span className="goal-card-top">
        <span className="badge">{goal.badge}</span>
        {selected && <CheckCircle2 size={20} />}
      </span>
      <span className="goal-card-title">{goal.label}</span>
      <span className="goal-card-copy">{goal.description}</span>
    </button>
  );
}

export default GoalCard;
