import { getGoalDefinition } from "../utils/goalLabels.js";

function ProgressSummary({ item }) {
  const goal = getGoalDefinition(item.goalType);

  return (
    <article className={`summary-card accent-${goal.accent}`}>
      <div className="summary-card-head">
        <div>
          <span className="eyebrow">{goal.badge}</span>
          <h3>{goal.label}</h3>
        </div>
        <strong>{item.completionRate}%</strong>
      </div>
      <div className="progress-track" aria-label={`${goal.label} completion`}>
        <span style={{ width: `${item.completionRate}%` }} />
      </div>
      <p>
        {item.completedTasks} of {item.totalTasks} generated tasks completed.
      </p>
      {item.latestCheckIn?.notes && <p className="muted">Latest note: {item.latestCheckIn.notes}</p>}
    </article>
  );
}

export default ProgressSummary;
