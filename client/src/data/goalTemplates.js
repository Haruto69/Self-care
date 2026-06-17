const yesNo = ["Yes", "No"];

export const GOAL_TEMPLATES = {
  exercise: {
    id: "exercise",
    label: "Exercise / Bodybuilding",
    shortLabel: "Body",
    description: "Training, recovery, water, and nutrition habits.",
    badge: "Strength",
    accent: "body",
    setupQuestions: [
      {
        name: "primaryGoal",
        label: "Primary goal",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Gain weight", "Lose weight", "Build muscle", "Recomposition"]
      },
      { name: "age", label: "Age", type: "number", required: true, defaultValue: "", min: 10 },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Female", "Male", "Non-binary", "Prefer not to say"]
      },
      { name: "height", label: "Height (cm)", type: "number", required: true, defaultValue: "", min: 80 },
      {
        name: "currentWeight",
        label: "Current weight (kg)",
        type: "number",
        required: true,
        defaultValue: "",
        min: 20,
        step: "0.1"
      },
      {
        name: "targetWeight",
        label: "Target weight (kg)",
        type: "number",
        required: true,
        defaultValue: "",
        min: 20,
        step: "0.1"
      },
      {
        name: "experienceLevel",
        label: "Experience level",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Never", "Beginner", "Intermediate", "Advanced"]
      },
      {
        name: "trainingDaysPerWeek",
        label: "Training days per week",
        type: "number",
        required: true,
        defaultValue: "",
        min: 1,
        max: 7
      },
      {
        name: "timePerWorkout",
        label: "Time per workout",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["30 min", "45 min", "60 min", "90+ min"]
      },
      {
        name: "gymAccess",
        label: "Gym access",
        type: "select",
        required: true,
        defaultValue: "",
        options: yesNo
      },
      {
        name: "homeEquipment",
        label: "Home equipment",
        type: "multi",
        required: false,
        defaultValue: [],
        options: ["Dumbbells", "Resistance bands", "Pull-up bar", "None"]
      },
      {
        name: "averageSleepDuration",
        label: "Average sleep duration",
        type: "number",
        required: true,
        defaultValue: "",
        min: 0,
        max: 14,
        step: "0.5"
      },
      {
        name: "dailyWaterIntake",
        label: "Daily water intake (liters)",
        type: "number",
        required: true,
        defaultValue: "",
        min: 0,
        step: "0.1"
      },
      {
        name: "dietaryPreference",
        label: "Dietary preference",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Vegetarian", "Non-vegetarian", "Vegan"]
      }
    ]
  },
  skincare: {
    id: "skincare",
    label: "Acne Reduction / Skincare",
    shortLabel: "Skin",
    description: "Gentle daily care for cleaner, calmer skin.",
    badge: "Routine",
    accent: "skin",
    setupQuestions: [
      {
        name: "acneSeverity",
        label: "Acne severity",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Mild", "Moderate", "Severe"]
      },
      {
        name: "washesFaceDaily",
        label: "Do you wash your face daily?",
        type: "select",
        required: true,
        defaultValue: "",
        options: yesNo
      },
      {
        name: "usesSunscreen",
        label: "Do you use sunscreen?",
        type: "select",
        required: true,
        defaultValue: "",
        options: yesNo
      },
      {
        name: "usesMoisturizer",
        label: "Do you use moisturizer?",
        type: "select",
        required: true,
        defaultValue: "",
        options: yesNo
      },
      {
        name: "averageSleepDuration",
        label: "Average sleep duration",
        type: "number",
        required: true,
        defaultValue: "",
        min: 0,
        max: 14,
        step: "0.5"
      },
      {
        name: "waterIntakePerDay",
        label: "Water intake per day (liters)",
        type: "number",
        required: true,
        defaultValue: "",
        min: 0,
        step: "0.1"
      },
      {
        name: "faceTouchFrequency",
        label: "How often do you touch or pick your face?",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Never", "Sometimes", "Often"]
      },
      {
        name: "pillowcaseFrequency",
        label: "How often do you change your pillowcase?",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Weekly", "Every 2 weeks", "Monthly", "Rarely"]
      }
    ]
  },
  focus: {
    id: "focus",
    label: "Focus / Studying",
    shortLabel: "Focus",
    description: "Study sessions, distraction control, and review.",
    badge: "Deep work",
    accent: "focus",
    setupQuestions: [
      {
        name: "focusObjective",
        label: "Focus objective",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["School", "College", "Competitive exams", "Coding", "Work", "Personal learning"]
      },
      {
        name: "currentFocusHours",
        label: "Current focus hours per day",
        type: "number",
        required: true,
        defaultValue: "",
        min: 0,
        max: 16,
        step: "0.5"
      },
      {
        name: "targetFocusHours",
        label: "Target focus hours per day",
        type: "number",
        required: true,
        defaultValue: "",
        min: 0.5,
        max: 16,
        step: "0.5"
      },
      {
        name: "mainDistraction",
        label: "Main distraction",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Phone", "Social media", "YouTube", "Gaming", "Daydreaming", "Procrastination"]
      },
      {
        name: "preferredSessionLength",
        label: "Preferred session length",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["25 min", "45 min", "60 min", "90 min"]
      },
      {
        name: "studyEnvironment",
        label: "Study environment",
        type: "select",
        required: true,
        defaultValue: "",
        options: ["Home", "Library", "College", "Cafe"]
      },
      {
        name: "strictDailyTargets",
        label: "Strict daily targets",
        type: "select",
        required: true,
        defaultValue: "",
        options: yesNo
      }
    ]
  }
};

export const GOAL_DEFINITIONS = Object.fromEntries(
  Object.entries(GOAL_TEMPLATES).map(([id, template]) => [
    id,
    {
      id: template.id,
      label: template.label,
      shortLabel: template.shortLabel,
      description: template.description,
      badge: template.badge,
      accent: template.accent
    }
  ])
);

export const GOAL_QUESTIONS = Object.fromEntries(
  Object.entries(GOAL_TEMPLATES).map(([id, template]) => [id, template.setupQuestions])
);

export const GOAL_TEMPLATE_LIST = Object.values(GOAL_TEMPLATES);
