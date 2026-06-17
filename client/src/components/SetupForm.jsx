import { GOAL_QUESTIONS } from "../data/goalQuestions.js";
import { getGoalDefinition } from "../utils/goalLabels.js";

function SetupForm({ goalType, answers, onChange }) {
  const questions = GOAL_QUESTIONS[goalType] || [];
  const goal = getGoalDefinition(goalType);

  const updateAnswer = (name, value) => {
    onChange(goalType, { ...answers, [name]: value });
  };

  const toggleMulti = (name, option) => {
    const current = Array.isArray(answers[name]) ? answers[name] : [];
    const next = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];

    updateAnswer(name, next);
  };

  return (
    <section className={`setup-panel accent-${goal.accent}`}>
      <div className="section-heading">
        <span className="eyebrow">{goal.badge}</span>
        <h2>{goal.label}</h2>
      </div>

      <div className="setup-grid">
        {questions.map((question) => (
          <label className="field" key={question.name}>
            <span>{question.label}</span>
            {question.type === "select" && (
              <select
                value={answers[question.name] || ""}
                onChange={(event) => updateAnswer(question.name, event.target.value)}
                required
              >
                <option value="">Select</option>
                {question.options.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {question.type === "number" && (
              <input
                type="number"
                value={answers[question.name] || ""}
                min={question.min}
                max={question.max}
                step={question.step || "1"}
                onChange={(event) => updateAnswer(question.name, event.target.value)}
                required
              />
            )}

            {question.type === "multi" && (
              <span className="segmented-options" role="group" aria-label={question.label}>
                {question.options.map((option) => {
                  const active = Array.isArray(answers[question.name])
                    ? answers[question.name].includes(option)
                    : false;

                  return (
                    <button
                      type="button"
                      className={active ? "selected" : ""}
                      onClick={() => toggleMulti(question.name, option)}
                      key={option}
                    >
                      {option}
                    </button>
                  );
                })}
              </span>
            )}
          </label>
        ))}
      </div>
    </section>
  );
}

export default SetupForm;
