import { getWeekNumber } from "./dateUtils.js";

const numberFrom = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const sessionMinutes = (value = "25 min") => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? 25 : parsed;
};

const yes = (value) => String(value || "").toLowerCase() === "yes";

const weeklyPillowcaseDue = (frequency, date) => {
  const day = date.getDay();
  const week = getWeekNumber(date);

  if (frequency === "Weekly") return day === 1;
  if (frequency === "Every 2 weeks") return day === 1 && week % 2 === 0;
  if (frequency === "Monthly") return date.getDate() === 1;
  return date.getDate() === 1;
};

const buildExerciseTasks = (options, date) => {
  const trainingDays = numberFrom(options.trainingDaysPerWeek, 3);
  const dayNumber = date.getDay() === 0 ? 7 : date.getDay();
  const hasWorkoutToday = dayNumber <= Math.max(1, Math.min(trainingDays, 7));
  const waterTarget = options.dailyWaterIntake || "your target";
  const sleepTarget = Math.max(7, numberFrom(options.averageSleepDuration, 7));
  const equipment = Array.isArray(options.homeEquipment)
    ? options.homeEquipment.filter((item) => item !== "None").join(", ")
    : "";

  const tasks = [
    {
      title: hasWorkoutToday ? "Complete today's workout" : "Do a short recovery routine",
      description: hasWorkoutToday
        ? `Train for ${options.timePerWorkout || "45 min"} at your ${
            yes(options.gymAccess) ? "gym" : equipment || "home setup"
          }.`
        : "Walk, stretch, or do light mobility so the habit stays alive.",
      frequency: "daily"
    },
    {
      title: "Drink your water target",
      description: `Aim for ${waterTarget} today.`,
      frequency: "daily"
    },
    {
      title: "Sleep at least 7 hours",
      description: `Protect recovery with a ${sleepTarget}-hour sleep window if possible.`,
      frequency: "daily"
    },
    {
      title: "Hit your protein goal",
      description: `${options.dietaryPreference || "Balanced"} meals should include a clear protein source.`,
      frequency: "daily"
    }
  ];

  if (date.getDay() === 1) {
    tasks.push({
      title: "Log weight weekly",
      description: `Compare your current weight with your ${options.targetWeight || "target"} goal.`,
      frequency: "weekly"
    });
  }

  return tasks;
};

const buildSkincareTasks = (options, date) => {
  const tasks = [
    {
      title: "Wash face in the morning",
      description: yes(options.washesFaceDaily)
        ? "Keep the routine gentle and consistent."
        : "Start with a gentle cleanser and avoid scrubbing.",
      frequency: "daily"
    },
    {
      title: "Apply moisturizer",
      description: yes(options.usesMoisturizer)
        ? "Use a light layer after cleansing."
        : "Try a non-comedogenic moisturizer after cleansing.",
      frequency: "daily"
    },
    {
      title: "Apply sunscreen",
      description: yes(options.usesSunscreen)
        ? "Use sunscreen before daytime outdoor exposure."
        : "Add sunscreen before daytime outdoor exposure.",
      frequency: "daily"
    },
    {
      title: "Wash face at night",
      description: "Remove sweat, sunscreen, and oil before bed.",
      frequency: "daily"
    },
    {
      title: "Do not pick acne",
      description: `Your current picking pattern is ${options.faceTouchFrequency || "Sometimes"}; keep hands away today.`,
      frequency: "daily"
    },
    {
      title: "Drink skin-supportive water",
      description: `Aim for ${options.waterIntakePerDay || "your target"} today.`,
      frequency: "daily"
    }
  ];

  if (weeklyPillowcaseDue(options.pillowcaseFrequency, date)) {
    tasks.push({
      title: "Change your pillowcase",
      description: `Matches your selected ${options.pillowcaseFrequency || "weekly"} pillowcase rhythm.`,
      frequency: "weekly"
    });
  }

  return tasks;
};

const buildFocusTasks = (options) => {
  const targetHours = numberFrom(options.targetFocusHours, 2);
  const minutes = sessionMinutes(options.preferredSessionLength);
  const sessions = Math.max(1, Math.ceil((targetHours * 60) / minutes));
  const distraction = options.mainDistraction || "main distraction";

  const tasks = [
    {
      title: `Complete ${sessions} focus session${sessions > 1 ? "s" : ""}`,
      description: `Use ${minutes}-minute sessions for ${options.focusObjective || "your main objective"}.`,
      frequency: "daily"
    },
    {
      title: "Keep phone away during study",
      description: "Place it outside reach before the first session starts.",
      frequency: "daily"
    },
    {
      title: `Avoid ${distraction}`,
      description: `Protect your ${options.studyEnvironment || "study"} environment from this trigger.`,
      frequency: "daily"
    },
    {
      title: "Complete end-of-day review",
      description: "Write what worked, what slipped, and the first task for tomorrow.",
      frequency: "daily"
    }
  ];

  if (yes(options.strictDailyTargets)) {
    tasks.push({
      title: "Write a strict target list",
      description: "Pick the exact chapters, tasks, or problems before starting.",
      frequency: "daily"
    });
  }

  return tasks;
};

export const buildTasksForGoal = (goal, date = new Date()) => {
  const options = goal.selectedOptions || {};

  if (goal.goalType === "exercise") return buildExerciseTasks(options, date);
  if (goal.goalType === "skincare") return buildSkincareTasks(options, date);
  if (goal.goalType === "focus") return buildFocusTasks(options, date);

  return [];
};
