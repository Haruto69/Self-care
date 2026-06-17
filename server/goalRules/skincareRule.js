import { weeklyPillowcaseDue, yes } from "./ruleUtils.js";

export const skincareRule = {
  id: "skincare",
  setupFields: [
    {
      name: "acneSeverity",
      type: "select",
      required: true,
      options: ["Mild", "Moderate", "Severe"]
    },
    { name: "washesFaceDaily", type: "select", required: true, options: ["Yes", "No"] },
    { name: "usesSunscreen", type: "select", required: true, options: ["Yes", "No"] },
    { name: "usesMoisturizer", type: "select", required: true, options: ["Yes", "No"] },
    { name: "averageSleepDuration", type: "number", required: true, min: 0, max: 14 },
    { name: "waterIntakePerDay", type: "number", required: true, min: 0 },
    {
      name: "faceTouchFrequency",
      type: "select",
      required: true,
      options: ["Never", "Sometimes", "Often"]
    },
    {
      name: "pillowcaseFrequency",
      type: "select",
      required: true,
      options: ["Weekly", "Every 2 weeks", "Monthly", "Rarely"]
    }
  ],
  generateTasks(options, date) {
    const tasks = [
      {
        taskKey: "skincare-morning-wash",
        title: "Wash face in the morning",
        description: yes(options.washesFaceDaily)
          ? "Keep the routine gentle and consistent."
          : "Start with a gentle cleanser and avoid scrubbing.",
        frequency: "daily"
      },
      {
        taskKey: "skincare-moisturizer",
        title: "Apply moisturizer",
        description: yes(options.usesMoisturizer)
          ? "Use a light layer after cleansing."
          : "Try a non-comedogenic moisturizer after cleansing.",
        frequency: "daily"
      },
      {
        taskKey: "skincare-sunscreen",
        title: "Apply sunscreen",
        description: yes(options.usesSunscreen)
          ? "Use sunscreen before daytime outdoor exposure."
          : "Add sunscreen before daytime outdoor exposure.",
        frequency: "daily"
      },
      {
        taskKey: "skincare-night-wash",
        title: "Wash face at night",
        description: "Remove sweat, sunscreen, and oil before bed.",
        frequency: "daily"
      },
      {
        taskKey: "skincare-no-picking",
        title: "Do not pick acne",
        description: `Your current picking pattern is ${options.faceTouchFrequency || "Sometimes"}; keep hands away today.`,
        frequency: "daily"
      },
      {
        taskKey: "skincare-water",
        title: "Drink skin-supportive water",
        description: `Aim for ${options.waterIntakePerDay || "your target"} today.`,
        frequency: "daily"
      }
    ];

    if (weeklyPillowcaseDue(options.pillowcaseFrequency, date)) {
      tasks.push({
        taskKey: "skincare-pillowcase",
        title: "Change your pillowcase",
        description: `Matches your selected ${options.pillowcaseFrequency || "weekly"} pillowcase rhythm.`,
        frequency: "weekly"
      });
    }

    return tasks;
  }
};
