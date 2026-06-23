import { dateVariant, dayName, numberFrom, sessionMinutes, yes } from "./ruleUtils.js";

export const focusRule = {
  id: "focus",
  setupFields: [
    {
      name: "focusObjective",
      type: "select",
      required: true,
      options: ["School", "College", "Competitive exams", "Coding", "Work", "Personal learning"]
    },
    { name: "currentFocusHours", type: "number", required: true, min: 0, max: 16 },
    { name: "targetFocusHours", type: "number", required: true, min: 0.5, max: 16 },
    {
      name: "mainDistraction",
      type: "select",
      required: true,
      options: ["Phone", "Social media", "YouTube", "Gaming", "Daydreaming", "Procrastination"]
    },
    {
      name: "preferredSessionLength",
      type: "select",
      required: true,
      options: ["25 min", "45 min", "60 min", "90 min"]
    },
    {
      name: "studyEnvironment",
      type: "select",
      required: true,
      options: ["Home", "Library", "College", "Cafe"]
    },
    { name: "strictDailyTargets", type: "select", required: true, options: ["Yes", "No"] }
  ],
  generateTasks(options, date = new Date()) {
    const targetHours = numberFrom(options.targetFocusHours, 2);
    const minutes = sessionMinutes(options.preferredSessionLength);
    const sessions = Math.max(1, Math.ceil((targetHours * 60) / minutes));
    const distraction = options.mainDistraction || "main distraction";
    const todayName = dayName(date);
    const phonePrompt = dateVariant(date, [
      "Place it outside reach before the first session starts.",
      "Put it in another room until the next planned break.",
      "Turn on silent mode before opening the first task."
    ]);
    const reviewPrompt = dateVariant(date, [
      "Write what worked, what slipped, and the first task for tomorrow.",
      "Capture the best session, the biggest blocker, and tomorrow's first move.",
      "Note one improvement you can make before the next session."
    ]);

    const tasks = [
      {
        taskKey: "focus-sessions",
        title: `Complete ${sessions} focus session${sessions > 1 ? "s" : ""}`,
        description: `Use ${minutes}-minute sessions for ${options.focusObjective || "your main objective"} this ${todayName}.`,
        frequency: "daily"
      },
      {
        taskKey: "focus-phone-away",
        title: "Keep phone away during study",
        description: phonePrompt,
        frequency: "daily"
      },
      {
        taskKey: "focus-avoid-distraction",
        title: `Avoid ${distraction}`,
        description: `Protect your ${options.studyEnvironment || "study"} environment from this trigger.`,
        frequency: "daily"
      },
      {
        taskKey: "focus-review",
        title: "Complete end-of-day review",
        description: reviewPrompt,
        frequency: "daily"
      }
    ];

    if (yes(options.strictDailyTargets)) {
      tasks.push({
        taskKey: "focus-strict-targets",
        title: "Write a strict target list",
        description: "Pick the exact chapters, tasks, or problems before starting.",
        frequency: "daily"
      });
    }

    return tasks;
  }
};