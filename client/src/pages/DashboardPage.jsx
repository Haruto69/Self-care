import { RefreshCw, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import TaskCard from "../components/TaskCard.jsx";
import { taskService } from "../services/api.js";
import { getCompletionRate, getGoalDefinition, groupTasksByGoal } from "../utils/goalLabels.js";

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingIds, setTogglingIds] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const completion = getCompletionRate(tasks);

  const groupedTasks = useMemo(() => Object.values(groupTasksByGoal(tasks)), [tasks]);

  const loadTasks = async () => {
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const today = await taskService.today();

      if (today.length) {
        setTasks(today);
      } else {
        const generated = await taskService.generate();
        setTasks(generated.tasks);
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not load today's tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const toggleTask = async (id) => {
    const previousTask = tasks.find((task) => task._id === id);

    if (!previousTask || togglingIds.includes(id)) return;

    setError("");
    setNotice("");
    setTogglingIds((current) => [...current, id]);
    setTasks((current) =>
      current.map((task) =>
        task._id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : null
            }
          : task
      )
    );

    try {
      const updated = await taskService.toggle(id);
      setTasks((current) => current.map((task) => (task._id === id ? updated : task)));
    } catch (apiError) {
      setTasks((current) => current.map((task) => (task._id === id ? previousTask : task)));
      setError(apiError.response?.data?.message || "Could not update that task. Your change was undone.");
    } finally {
      setTogglingIds((current) => current.filter((taskId) => taskId !== id));
    }
  };

  const regenerateTasks = async () => {
    setRefreshing(true);
    setError("");
    setNotice("");

    try {
      const generated = await taskService.generate();
      setTasks(generated.tasks);
      setNotice(generated.message || (generated.changed ? "Tasks refreshed" : "Tasks are already up to date"));
    } catch (apiError) {
      setNotice("");
      setError(apiError.response?.data?.message || "Could not refresh today's tasks. Please try again.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading today's plan" />;

  return (
    <section className="page-stack">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Today</span>
          <h1>Your self-care rhythm</h1>
          <p>{tasks.length ? `${tasks.length} tasks generated for today.` : "No tasks generated yet."}</p>
        </div>
        <div className="completion-card">
          <strong>{completion}%</strong>
          <span>complete</span>
          <div className="progress-track" aria-label="Today's completion">
            <span style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      {error && <p className="alert" role="alert">{error}</p>}
      {notice && !error && (
        <p className="notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}

      <div className="action-row">
        <button className="button secondary" onClick={regenerateTasks} disabled={refreshing}>
          <RefreshCw size={18} />
          {refreshing ? "Refreshing" : "Refresh tasks"}
        </button>
        <Link to="/goals" className="button quiet">
          <Target size={18} />
          Edit goals
        </Link>
      </div>

      {!tasks.length ? (
        <div className="empty-state">
          <span className="eyebrow">No active plan</span>
          <h2>Set up a goal first</h2>
          <p>Your daily tasks appear here after setup.</p>
          <Link to="/goals" className="button primary">
            Select goals
          </Link>
        </div>
      ) : (
        <div className="task-groups">
          {groupedTasks.map((group) => {
            const goal = getGoalDefinition(group.goalType);
            const groupCompletion = getCompletionRate(group.tasks);

            return (
              <section className={`task-group accent-${goal.accent}`} key={group.goal?._id || group.goalType}>
                <div className="task-group-head">
                  <div>
                    <span className="eyebrow">{goal.badge}</span>
                    <h2>{goal.label}</h2>
                  </div>
                  <span className="pill">{groupCompletion}%</span>
                </div>
                <div className="task-list">
                  {group.tasks.map((task) => (
                    <TaskCard
                      task={task}
                      onToggle={toggleTask}
                      disabled={togglingIds.includes(task._id)}
                      key={task._id}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default DashboardPage;