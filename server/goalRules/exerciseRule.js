import { dateVariant, dayName, numberFrom, yes } from "./ruleUtils.js";

export const exerciseRule = {
  id: "exercise",
  setupFields: [
    {
      name: "primaryGoal",
      type: "select",
      required: true,
      options: ["Gain weight", "Lose weight", "Build muscle", "Recomposition"]
    },
    { name: "age", type: "number", required: true, min: 10 },
    {
      name: "gender",
      type: "select",
      required: true,
      options: ["Female", "Male", "Non-binary", "Prefer not to say"]
    },
    { name: "height", type: "number", required: true, min: 80 },
    { name: "currentWeight", type: "number", required: true, min: 20 },
    { name: "targetWeight", type: "number", required: true, min: 20 },
    {
      name: "experienceLevel",
      type: "select",
      required: true,
      options: ["Never", "Beginner", "Intermediate", "Advanced"]
    },
    { name: "trainingDaysPerWeek", type: "number", required: true, min: 1, max: 7 },
    {
      name: "timePerWorkout",
      type: "select",
      required: true,
      options: ["30 min", "45 min", "60 min", "90+ min"]
    },
    { name: "gymAccess", type: "select", required: true, options: ["Yes", "No"] },
    {
      name: "homeEquipment",
      type: "multi",
      required: false,
      options: ["Dumbbells", "Resistance bands", "Pull-up bar", "None"]
    },
    { name: "averageSleepDuration", type: "number", required: true, min: 0, max: 14 },
    { name: "dailyWaterIntake", type: "number", required: true, min: 0 },
    {
      name: "dietaryPreference",
      type: "select",
      required: true,
      options: ["Vegetarian", "Non-vegetarian", "Vegan"]
    }
  ],
  generateTasks(options, date) {
    const trainingDays = numberFrom(options.trainingDaysPerWeek, 3);
    const dayNumber = date.getDay() === 0 ? 7 : date.getDay();
    const hasWorkoutToday = dayNumber <= Math.max(1, Math.min(trainingDays, 7));
    const waterTarget = options.dailyWaterIntake || "your target";
    const sleepTarget = Math.max(7, numberFrom(options.averageSleepDuration, 7));
    const equipment = Array.isArray(options.homeEquipment)
      ? options.homeEquipment.filter((item) => item !== "None").join(", ")
      : "";
    const workoutPrompt = dateVariant(date, [
      "Start with an easy warm-up and write down one win after training.",
      "Keep the first set controlled so the session starts cleanly.",
      "Finish with a short cooldown to make tomorrow easier."
    ]);
    const recoveryPrompt = dateVariant(date, [
      "Walk, stretch, or do light mobility",
      "Take an easy walk and loosen the tightest area",
      "Do gentle mobility and keep the streak alive"
    ]);
    const todayName = dayName(date);

    const tasks = [
      {
        taskKey: "exercise-workout",
        title: hasWorkoutToday ? "Complete today's workout" : "Do a short recovery routine",
        description: hasWorkoutToday
          ? `Train for ${options.timePerWorkout || "45 min"} at your ${
              yes(options.gymAccess) ? "gym" : equipment || "home setup"
            }. ${workoutPrompt}`
          : `${recoveryPrompt} so the habit stays alive.`,
        frequency: "daily"
      },
      {
        taskKey: "exercise-water",
        title: "Drink your water target",
        description: `Aim for ${waterTarget} this ${todayName}.`,
        frequency: "daily"
      },
      {
        taskKey: "exercise-sleep",
        title: "Sleep at least 7 hours",
        description: `Protect recovery with a ${sleepTarget}-hour sleep window if possible.`,
        frequency: "daily"
      },
      {
        taskKey: "exercise-protein",
        title: "Hit your protein goal",
        description: `${options.dietaryPreference || "Balanced"} meals should include a clear protein source.`,
        frequency: "daily"
      }
    ];

    if (date.getDay() === 1) {
      tasks.push({
        taskKey: "exercise-weight-log",
        title: "Log weight weekly",
        description: `Compare your current weight with your ${options.targetWeight || "target"} goal.`,
        frequency: "weekly"
      });
    }

    return tasks;
  }
};