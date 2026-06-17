import { Check } from "lucide-react";

function TaskCard({ task, onToggle }) {
  return (
    <article className={`task-card ${task.completed ? "complete" : ""}`}>
      <button
        type="button"
        className="check-button"
        onClick={() => onToggle(task._id)}
        aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
      >
        {task.completed && <Check size={17} />}
      </button>
      <div>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
        <span className="small-badge">{task.frequency}</span>
      </div>
    </article>
  );
}

export default TaskCard;
