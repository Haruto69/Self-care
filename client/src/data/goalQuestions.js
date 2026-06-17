export const GOAL_DEFINITIONS = {
  exercise: {
    label: "Exercise / Bodybuilding",
    shortLabel: "Body",
    description: "Training, recovery, water, and nutrition habits.",
    badge: "Strength",
    accent: "body"
  },
  skincare: {
    label: "Acne Reduction / Skincare",
    shortLabel: "Skin",
    description: "Gentle daily care for cleaner, calmer skin.",
    badge: "Routine",
    accent: "skin"
  },
  focus: {
    label: "Focus / Studying",
    shortLabel: "Focus",
    description: "Study sessions, distraction control, and review.",
    badge: "Deep work",
    accent: "focus"
  }
};

export const GOAL_QUESTIONS = {
  exercise: [
    {
      name: "primaryGoal",
      label: "Primary goal",
      type: "select",
      options: ["Gain weight", "Lose weight", "Build muscle", "Recomposition"]
    },
    { name: "age", label: "Age", type: "number", min: 10 },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Female", "Male", "Non-binary", "Prefer not to say"]
    },
    { name: "height", label: "Height (cm)", type: "number", min: 80 },
    { name: "currentWeight", label: "Current weight (kg)", type: "number", min: 20, step: "0.1" },
    { name: "targetWeight", label: "Target weight (kg)", type: "number", min: 20, step: "0.1" },
    {
      name: "experienceLevel",
      label: "Experience level",
      type: "select",
      options: ["Never", "Beginner", "Intermediate", "Advanced"]
    },
    {
      name: "trainingDaysPerWeek",
      label: "Training days per week",
      type: "number",
      min: 1,
      max: 7
    },
    {
      name: "timePerWorkout",
      label: "Time per workout",
      type: "select",
      options: ["30 min", "45 min", "60 min", "90+ min"]
    },
    { name: "gymAccess", label: "Gym access", type: "select", options: ["Yes", "No"] },
    {
      name: "homeEquipment",
      label: "Home equipment",
      type: "multi",
      options: ["Dumbbells", "Resistance bands", "Pull-up bar", "None"]
    },
    {
      name: "averageSleepDuration",
      label: "Average sleep duration",
      type: "number",
      min: 0,
      max: 14,
      step: "0.5"
    },
    {
      name: "dailyWaterIntake",
      label: "Daily water intake (liters)",
      type: "number",
      min: 0,
      step: "0.1"
    },
    {
      name: "dietaryPreference",
      label: "Dietary preference",
      type: "select",
      options: ["Vegetarian", "Non-vegetarian", "Vegan"]
    }
  ],
  skincare: [
    {
      name: "acneSeverity",
      label: "Acne severity",
      type: "select",
      options: ["Mild", "Moderate", "Severe"]
    },
    { name: "washesFaceDaily", label: "Do you wash your face daily?", type: "select", options: ["Yes", "No"] },
    { name: "usesSunscreen", label: "Do you use sunscreen?", type: "select", options: ["Yes", "No"] },
    { name: "usesMoisturizer", label: "Do you use moisturizer?", type: "select", options: ["Yes", "No"] },
    {
      name: "averageSleepDuration",
      label: "Average sleep duration",
      type: "number",
      min: 0,
      max: 14,
      step: "0.5"
    },
    {
      name: "waterIntakePerDay",
      label: "Water intake per day (liters)",
      type: "number",
      min: 0,
      step: "0.1"
    },
    {
      name: "faceTouchFrequency",
      label: "How often do you touch or pick your face?",
      type: "select",
      options: ["Never", "Sometimes", "Often"]
    },
    {
      name: "pillowcaseFrequency",
      label: "How often do you change your pillowcase?",
      type: "select",
      options: ["Weekly", "Every 2 weeks", "Monthly", "Rarely"]
    }
  ],
  focus: [
    {
      name: "focusObjective",
      label: "Focus objective",
      type: "select",
      options: ["School", "College", "Competitive exams", "Coding", "Work", "Personal learning"]
    },
    {
      name: "currentFocusHours",
      label: "Current focus hours per day",
      type: "number",
      min: 0,
      max: 16,
      step: "0.5"
    },
    {
      name: "targetFocusHours",
      label: "Target focus hours per day",
      type: "number",
      min: 0.5,
      max: 16,
      step: "0.5"
    },
    {
      name: "mainDistraction",
      label: "Main distraction",
      type: "select",
      options: ["Phone", "Social media", "YouTube", "Gaming", "Daydreaming", "Procrastination"]
    },
    {
      name: "preferredSessionLength",
      label: "Preferred session length",
      type: "select",
      options: ["25 min", "45 min", "60 min", "90 min"]
    },
    {
      name: "studyEnvironment",
      label: "Study environment",
      type: "select",
      options: ["Home", "Library", "College", "Cafe"]
    },
    { name: "strictDailyTargets", label: "Strict daily targets", type: "select", options: ["Yes", "No"] }
  ]
};
